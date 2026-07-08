import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req) {
    try {
        const userId = getAuthenticatedUser(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // Auto-cleanup: Remove any subscriptions where the next_date is today or in the past
        await pool.query({
            text: "DELETE FROM tblsubscription WHERE user_id = $1 AND next_date <= CURRENT_DATE",
            values: [userId]
        });

        const subscriptions = await pool.query({
            text: "SELECT * FROM tblsubscription WHERE user_id = $1 ORDER BY next_date ASC",
            values: [userId]
        });

        return NextResponse.json({
            status: "success", 
            data: subscriptions.rows
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const userId = getAuthenticatedUser(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { name, amount, next_date, accountId } = await req.json();

        if (!name || !amount || !next_date || !accountId) {
            return NextResponse.json({ message: "Name, amount, next billing date, and source account are required." }, { status: 400 });
        }

        const numAmount = Number(amount);
        if (numAmount <= 0) {
            return NextResponse.json({ message: "Amount must be greater than zero." }, { status: 400 });
        }

        // Validate account
        const accountResult = await pool.query('SELECT * FROM tblaccount WHERE id = $1 AND user_id = $2', [accountId, userId]);
        if (accountResult.rows.length === 0) {
            return NextResponse.json({ message: "Account not found." }, { status: 404 });
        }
        
        const account = accountResult.rows[0];
        if (Number(account.account_balance) < numAmount) {
            return NextResponse.json({ message: "Insufficient funds in the selected account." }, { status: 400 });
        }

        const client = await pool.connect();
        let createdSub;
        try {
            await client.query('BEGIN');

            // 1. Deduct from account balance
            await client.query(`
                UPDATE tblaccount SET account_balance = account_balance - $1 WHERE id = $2
            `, [numAmount, accountId]);

            // 2. Insert expense transaction
            await client.query(`
                INSERT INTO tbltransaction (user_id, amount, description, type, status, source) 
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [userId, numAmount, `Subscription: ${name}`, 'expense', 'completed', account.account_name]);

            // 3. Create the subscription tracker
            const createSubResult = await client.query(`
                INSERT INTO tblsubscription (user_id, name, amount, next_date) VALUES ($1, $2, $3, $4) RETURNING *
            `, [userId, name, numAmount, next_date]);
            
            createdSub = createSubResult.rows[0];

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

        return NextResponse.json({
            status: "success", 
            data: createdSub,
            message: "Subscription added and paid successfully."
        }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
