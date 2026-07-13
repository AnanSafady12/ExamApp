import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

const isLocal = process.env.DATABASE_URL.includes('127.0.0.1') || process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('db');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection test failed:', err.message);
  } else {
    console.log(`🔌 Database connected successfully at: ${res.rows[0].now}`);
  }
});

export default pool;
export { pool };
