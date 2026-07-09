import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/utils';

export async function POST(req) {
    const client = await pool.connect();
    try {
        const { firstName, email, password } = await req.json();

        if (!firstName || !email || !password) {
            return NextResponse.json({ message: "All fields are required." }, { status: 400 });
        }

        const userExist = await client.query({
            text: "SELECT EXISTS (SELECT * FROM tbluser WHERE email = $1)",
            values: [email],
        });

        if (userExist.rows[0].exists) {
            return NextResponse.json({ message: "User already exists." }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);

        await client.query('BEGIN');

        // Ensure the has_dummy_data column exists
        await client.query(`
            ALTER TABLE tbluser ADD COLUMN IF NOT EXISTS has_dummy_data BOOLEAN DEFAULT FALSE;
        `);

        const user = await client.query({
            text: "INSERT INTO tbluser (firstname, email, password, has_dummy_data) VALUES ($1, $2, $3, true) RETURNING *",
            values: [firstName, email, hashedPassword],
        });

        const userData = user.rows[0];
        const uid = userData.id;

        // Insert Dummy Account
        const accRes = await client.query(`
            INSERT INTO tblaccount (user_id, account_name, account_balance) 
            VALUES ($1, 'HDFC Bank', 150000.00) RETURNING id
        `, [uid]);
        const accId = accRes.rows[0].id;

        // Insert Dummy Transactions (4-5 months of history)
        await client.query(`
            INSERT INTO tbltransaction (user_id, amount, description, type, status, source, category, sub_category, created_at)
            VALUES 
            ($1, 2100.00, 'Shopping', 'expense', 'completed', 'HDFC Bank', 'Shopping', 'Amazon', CURRENT_DATE - INTERVAL '2 days'),
            ($1, 299.00, 'Movie', 'expense', 'completed', 'HDFC Bank', 'Movie', 'PVR', CURRENT_DATE - INTERVAL '5 days'),
            ($1, 5000.00, 'Investment', 'expense', 'completed', 'HDFC Bank', 'Investment', 'Grow', CURRENT_DATE - INTERVAL '9 days'),
            ($1, 2460.00, 'Travel', 'expense', 'completed', 'HDFC Bank', 'Travel', 'IRCTC', CURRENT_DATE - INTERVAL '13 days'),
            ($1, 678.00, 'Food', 'expense', 'completed', 'HDFC Bank', 'Food', 'Swiggy', CURRENT_DATE - INTERVAL '18 days'),
            ($1, 150000.00, 'Salary', 'income', 'completed', 'Employer', 'Income', 'Salary', CURRENT_DATE - INTERVAL '20 days'),
            
            ($1, 1800.00, 'Groceries', 'expense', 'completed', 'HDFC Bank', 'Shopping', 'Blinkit', CURRENT_DATE - INTERVAL '1 month 2 days'),
            ($1, 4500.00, 'Electricity Bill', 'expense', 'completed', 'HDFC Bank', 'Bills', 'Utilities', CURRENT_DATE - INTERVAL '1 month 5 days'),
            ($1, 150000.00, 'Salary', 'income', 'completed', 'Employer', 'Income', 'Salary', CURRENT_DATE - INTERVAL '1 month 20 days'),
            
            ($1, 3200.00, 'Dining Out', 'expense', 'completed', 'HDFC Bank', 'Food', 'Zomato', CURRENT_DATE - INTERVAL '2 months 10 days'),
            ($1, 12000.00, 'Flight Tickets', 'expense', 'completed', 'HDFC Bank', 'Travel', 'MakeMyTrip', CURRENT_DATE - INTERVAL '2 months 15 days'),
            ($1, 150000.00, 'Salary', 'income', 'completed', 'Employer', 'Income', 'Salary', CURRENT_DATE - INTERVAL '2 months 20 days'),
            
            ($1, 950.00, 'Netflix', 'expense', 'completed', 'HDFC Bank', 'Entertainment', 'Subscription', CURRENT_DATE - INTERVAL '3 months 5 days'),
            ($1, 5500.00, 'Car Insurance', 'expense', 'completed', 'HDFC Bank', 'Insurance', 'PolicyBazaar', CURRENT_DATE - INTERVAL '3 months 12 days'),
            ($1, 150000.00, 'Salary', 'income', 'completed', 'Employer', 'Income', 'Salary', CURRENT_DATE - INTERVAL '3 months 20 days'),
            
            ($1, 420.00, 'Coffee', 'expense', 'completed', 'HDFC Bank', 'Food', 'Starbucks', CURRENT_DATE - INTERVAL '4 months 3 days'),
            ($1, 8900.00, 'Hotel Booking', 'expense', 'completed', 'HDFC Bank', 'Travel', 'Agoda', CURRENT_DATE - INTERVAL '4 months 18 days'),
            ($1, 150000.00, 'Salary', 'income', 'completed', 'Employer', 'Income', 'Salary', CURRENT_DATE - INTERVAL '4 months 20 days'),

            ($1, 15000.00, 'Freelance Work', 'income', 'completed', 'Client', 'Income', 'Freelance', CURRENT_DATE - INTERVAL '5 months 8 days'),
            ($1, 2300.00, 'Gym Membership', 'expense', 'completed', 'HDFC Bank', 'Health', 'Cult.fit', CURRENT_DATE - INTERVAL '5 months 14 days'),
            ($1, 150000.00, 'Salary', 'income', 'completed', 'Employer', 'Income', 'Salary', CURRENT_DATE - INTERVAL '5 months 20 days')
        `, [uid]);

        // Insert Dummy Goal
        await client.query(`
            INSERT INTO tblgoal (user_id, name, target_amount, current_amount)
            VALUES ($1, 'Apple iPhone 17 Pro', 145000.00, 75000.00)
        `, [uid]);

        // Insert Dummy Subscriptions
        await client.query(`
            INSERT INTO tblsubscription (user_id, name, amount, next_date, icon_url)
            VALUES 
            ($1, 'Netflix', 149.00, CURRENT_DATE + INTERVAL '5 days', 'netflix-icon'),
            ($1, 'Spotify', 49.00, CURRENT_DATE + INTERVAL '12 days', 'spotify-icon'),
            ($1, 'Figma', 3999.00, CURRENT_DATE + INTERVAL '20 days', 'figma-icon'),
            ($1, 'WIFI', 399.00, CURRENT_DATE + INTERVAL '25 days', 'wifi-icon'),
            ($1, 'Electricity', 1265.00, CURRENT_DATE + INTERVAL '28 days', 'electricity-icon')
        `, [uid]);

        // Insert Dummy Investment
        await client.query(`
            INSERT INTO tblinvestment (user_id, total_amount, growth_amount)
            VALUES ($1, 145555.00, 100000.00)
        `, [uid]);

        await client.query('COMMIT');

        delete userData.password;
        
        return NextResponse.json({ user: userData }, { status: 201 });
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        return NextResponse.json({ message: error.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
