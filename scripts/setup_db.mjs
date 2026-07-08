import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATA_BASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setup() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Create tbluser
    await client.query(`
      CREATE TABLE IF NOT EXISTS tbluser (
        id SERIAL PRIMARY KEY,
        firstname VARCHAR(255) NOT NULL,
        lastname VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        country VARCHAR(100),
        currency VARCHAR(10),
        contact VARCHAR(20),
        accounts TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create tblaccount
    await client.query(`
      CREATE TABLE IF NOT EXISTS tblaccount (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES tbluser(id) ON DELETE CASCADE,
        account_name VARCHAR(255) NOT NULL,
        account_number VARCHAR(100),
        account_balance NUMERIC(15, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create tbltransaction
    await client.query(`
      CREATE TABLE IF NOT EXISTS tbltransaction (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES tbluser(id) ON DELETE CASCADE,
        amount NUMERIC(15, 2) NOT NULL,
        description TEXT,
        type VARCHAR(50),
        status VARCHAR(50),
        source VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log("Database schema created successfully.");
  } catch (e) {
    await client.query('ROLLBACK');
    console.error("Error creating schema", e);
  } finally {
    client.release();
    await pool.end();
  }
}

setup();
