-- FinTrack Database Schema for Supabase
-- Paste this entire file into the Supabase SQL Editor and click "Run"

BEGIN;

-- Create tbluser
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

-- Create tblaccount
CREATE TABLE IF NOT EXISTS tblaccount (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES tbluser(id) ON DELETE CASCADE,
  account_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(100),
  account_balance NUMERIC(15, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tbltransaction
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

COMMIT;
