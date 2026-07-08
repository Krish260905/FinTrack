const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' }); // Or just hardcode since we have it

const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres.wsegytdmjjlrrxjjvsqf:e9i7Mpz%24xQ2%2F%21g2@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
});

async function migrate() {
  try {
    await client.connect();
    
    // Add missing columns to tblinvestment
    await client.query(`ALTER TABLE tblinvestment ADD COLUMN IF NOT EXISTS asset_name VARCHAR(255) DEFAULT 'General Investment'`);
    await client.query(`ALTER TABLE tblinvestment ADD COLUMN IF NOT EXISTS asset_type VARCHAR(100) DEFAULT 'Mutual Fund'`);
    
    // Update the dummy data
    await client.query(`UPDATE tblinvestment SET asset_name = 'S&P 500 Index Fund', asset_type = 'Index Fund' WHERE id > 0`);

    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await client.end();
  }
}

migrate();
