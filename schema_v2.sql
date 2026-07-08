-- Schema Update (v2) for FinTrack
-- Paste this into your Supabase SQL Editor and run it.

BEGIN;

-- 1. Alter existing tables
ALTER TABLE tbltransaction ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE tbltransaction ADD COLUMN IF NOT EXISTS sub_category VARCHAR(100);

-- 2. Create new tables
CREATE TABLE IF NOT EXISTS tblgoal (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES tbluser(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  target_amount NUMERIC(15, 2) NOT NULL,
  current_amount NUMERIC(15, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tblsubscription (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES tbluser(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  next_date DATE,
  icon_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tblinvestment (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES tbluser(id) ON DELETE CASCADE,
  total_amount NUMERIC(15, 2) NOT NULL,
  growth_amount NUMERIC(15, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Insert Dummy Data
DO $$ 
DECLARE
    uid INTEGER;
BEGIN
    -- Get the first user ID
    SELECT id INTO uid FROM tbluser LIMIT 1;
    
    -- If a user exists, insert dummy data
    IF uid IS NOT NULL THEN
        -- Dummy Transactions
        INSERT INTO tbltransaction (user_id, amount, description, type, status, source, category, sub_category, created_at)
        VALUES 
        (uid, 2100.00, 'Shopping', 'expense', 'completed', 'UPI', 'Shopping', 'Amazon', CURRENT_DATE - INTERVAL '2 days'),
        (uid, 299.00, 'Movie', 'expense', 'completed', 'UPI', 'Movie', 'PVR', CURRENT_DATE - INTERVAL '5 days'),
        (uid, 5000.00, 'Investment', 'expense', 'completed', 'Bank', 'Investment', 'Grow', CURRENT_DATE - INTERVAL '9 days'),
        (uid, 2460.00, 'Travel', 'expense', 'completed', 'Card', 'Travel', 'IRCTC', CURRENT_DATE - INTERVAL '13 days'),
        (uid, 678.00, 'Food', 'expense', 'completed', 'UPI', 'Food', 'Swiggy', CURRENT_DATE - INTERVAL '18 days');

        -- Dummy Goal
        INSERT INTO tblgoal (user_id, name, target_amount, current_amount)
        VALUES (uid, 'Apple iPhone 17 Pro', 145000.00, 75000.00);

        -- Dummy Subscriptions
        INSERT INTO tblsubscription (user_id, name, amount, next_date, icon_url)
        VALUES 
        (uid, 'Netflix', 149.00, CURRENT_DATE + INTERVAL '5 days', 'netflix-icon'),
        (uid, 'Spotify', 49.00, CURRENT_DATE + INTERVAL '12 days', 'spotify-icon'),
        (uid, 'Figma', 3999.00, CURRENT_DATE + INTERVAL '20 days', 'figma-icon'),
        (uid, 'WIFI', 399.00, CURRENT_DATE + INTERVAL '25 days', 'wifi-icon'),
        (uid, 'Electricity', 1265.00, CURRENT_DATE + INTERVAL '28 days', 'electricity-icon');

        -- Dummy Investment
        INSERT INTO tblinvestment (user_id, total_amount, growth_amount)
        VALUES (uid, 145555.00, 100000.00);
    END IF;
END $$;

COMMIT;
