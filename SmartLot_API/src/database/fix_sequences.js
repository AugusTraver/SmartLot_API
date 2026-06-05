import pool from './db.js';

const TABLES = [
  'sedes',
  'empresas',
  'usuarios',
  'garages',
  'marcas',
  'modelos',
  'reservas',
  'roles',
  'vehiculos',
];

async function fixSequences() {
  const client = await pool.connect();
  try {
    for (const table of TABLES) {
      const seqName = `${table}_id_seq`;
      const result = await client.query(
        `SELECT setval($1, COALESCE((SELECT MAX(id) FROM ${table}), 0))`,
        [seqName]
      );
      console.log(`✓ ${table}: sequence set to ${result.rows[0].setval}`);
    }
    console.log('\nTodas las secuencias fueron sincronizadas.');
  } catch (error) {
    console.error('Error al sincronizar secuencias:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixSequences();
