import pool from '../src/database/db.js';

const client = await pool.connect();
try {
  await client.query('BEGIN');

  // 1. Create a vehicle for user 89
  const vehResult = await client.query(
    `INSERT INTO vehiculos (id_usuario, patente, id_modelo) VALUES (89, 'ABC123', 71) RETURNING id`
  );
  const idVehiculo = vehResult.rows[0].id;
  console.log('Created vehicle id:', idVehiculo);

  const garageId = 21;
  const now = new Date();

  function pastDate(daysAgo, hour, minute) {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, minute, 0, 0);
    return d;
  }

  // 2. Past reservation — COMPLETADA (entro=true, salio=true)
  const r1 = await client.query(
    `INSERT INTO reservas (id_usuario, id_garage, id_vehiculo, fecha_entrada, fecha_salida, entro, salio, dia)
     VALUES ($1, $2, $3, $4, $5, true, true, $6) RETURNING id`,
    [89, garageId, idVehiculo, pastDate(10, 9, 0), pastDate(10, 11, 0), 'Martes']
  );
  console.log('Completada reserva id:', r1.rows[0].id);

  // 3. Past reservation — CANCELADA (Borrado=true)
  const r2 = await client.query(
    `INSERT INTO reservas (id_usuario, id_garage, id_vehiculo, fecha_entrada, fecha_salida, entro, salio, dia, "Borrado")
     VALUES ($1, $2, $3, $4, $5, false, false, $6, true) RETURNING id`,
    [89, garageId, idVehiculo, pastDate(8, 14, 0), pastDate(8, 16, 0), 'Jueves']
  );
  console.log('Cancelada reserva id:', r2.rows[0].id);

  // 4. Past reservation — VENCIDA SIN ENTRAR (entro=false, salio=false)
  const r3 = await client.query(
    `INSERT INTO reservas (id_usuario, id_garage, id_vehiculo, fecha_entrada, fecha_salida, entro, salio, dia)
     VALUES ($1, $2, $3, $4, $5, false, false, $6) RETURNING id`,
    [89, garageId, idVehiculo, pastDate(5, 8, 0), pastDate(5, 10, 0), 'Lunes']
  );
  console.log('Vencida sin entrar reserva id:', r3.rows[0].id);

  await client.query('COMMIT');
  console.log('All done');
} catch (e) {
  await client.query('ROLLBACK');
  console.error(e);
} finally {
  client.release();
  pool.end();
}
