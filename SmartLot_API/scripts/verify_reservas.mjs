import pool from '../src/database/db.js';

const rows = await pool.query(
  `SELECT r.id, r.fecha_entrada, r.fecha_salida, r.entro, r.salio, r."Borrado", g.nombre AS garage, v.patente
   FROM reservas r
   LEFT JOIN garages g ON r.id_garage = g.id
   LEFT JOIN vehiculos v ON r.id_vehiculo = v.id
   WHERE r.id_usuario = 89
   ORDER BY r.fecha_entrada DESC`
);
console.log(JSON.stringify(rows.rows, null, 2));
pool.end();
