import pool from '../src/database/db.js';

async function checkDb() {
  const client = await pool.connect();
  try {
    const garages = await client.query('SELECT id, nombre, ocupacion_reservas, ocupacion_no_reservas, capacidad_reservas FROM garages');
    console.log('--- Garages ---');
    console.table(garages.rows);

    const reservas = await client.query('SELECT id, id_garage, entro, salio, "Borrado" FROM reservas');
    console.log('--- Reservas ---');
    console.table(reservas.rows);
  } catch (error) {
    console.error('Error checking DB:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkDb();
