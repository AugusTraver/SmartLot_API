import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();  
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
console.log(process.env.DATABASE_URL);
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error adquiriendo el cliente', err.stack);
  }
  console.log('Conexión exitosa a Supabase');
  release();
});

export default pool;