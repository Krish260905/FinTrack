import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(req) {
    try {
        const userId = getAuthenticatedUser(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { accountId, amount, description } = await req.json();

        if (!accountId || !amount || isNaN(amount) || amount <= 0) {
            return NextResponse.json({ message: "Invalid amount or account ID" }, { status: 400 });
        }

        // Get the account to make sure it belongs to the user and to get its name
        const accountResult = await pool.query('SELECT * FROM tblaccount WHERE id = $1 AND user_id = $2', [accountId, userId]);
        if (accountResult.rows.length === 0) {
            return NextResponse.json({ message: "Account not found" }, { status: 404 });
        }
        const account = accountResult.rows[0];

        // Update the account balance
        const updatedAccountResult = await pool.query(`
            UPDATE tblaccount 
            SET account_balance = account_balance + $1
            WHERE id = $2 AND user_id = $3
            RETURNING *
        `, [amount, accountId, userId]);

        // Insert income transaction
        const finalDesc = description || `Deposit to ${account.account_name}`;
        await pool.query(`
            INSERT INTO tbltransaction (user_id, amount, description, type, status, source) 
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [userId, amount, finalDesc, 'income', 'completed', account.account_name]);

        return NextResponse.json({
            status: "success", 
            message: "Money added successfully.",
            data: updatedAccountResult.rows[0]
        }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
