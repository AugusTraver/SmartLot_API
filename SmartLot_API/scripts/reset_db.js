import pool from '../src/database/db.js';

async function resetDb() {
  const client = await pool.connect();
  try {
    console.log('Resetting occupations for all garages...');
    const result = await client.query('UPDATE garages SET ocupacion_reservas = 0, ocupacion_no_reservas = 0');
    console.log(`✓ Ocupaciones de garages reseteadas. Filas afectadas: ${result.rowCount}`);

    console.log('Deleting all reservations...');
    const resResult = await client.query('DELETE FROM reservas');
    console.log(`✓ Reservas eliminadas. Filas afectadas: ${resResult.rowCount}`);
  } catch (error) {
    console.error('Error resetting DB:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

resetDb();
