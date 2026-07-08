import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(req) {
    try {
        const userId = getAuthenticatedUser(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { from_account_id, to_account_id, amount } = await req.json();

        if (!from_account_id || !to_account_id || !amount || Number(amount) <= 0) {
            return NextResponse.json({ message: "Valid accounts and amount are required" }, { status: 400 });
        }

        const sourceResult = await pool.query({
            text: "SELECT * FROM tblaccount WHERE id = $1 AND user_id = $2",
            values: [from_account_id, userId]
        });
        const sourceAccount = sourceResult.rows[0];

        const destResult = await pool.query({
            text: "SELECT * FROM tblaccount WHERE id = $1 AND user_id = $2",
            values: [to_account_id, userId]
        });
        const destAccount = destResult.rows[0];

        if (!sourceAccount || !destAccount) {
            return NextResponse.json({ message: "Account not found" }, { status: 404 });
        }

        if (Number(sourceAccount.account_balance) < Number(amount)) {
            return NextResponse.json({ message: "Insufficient balance in source account" }, { status: 400 });
        }

        await pool.query('BEGIN');

        await pool.query({
            text: "UPDATE tblaccount SET account_balance = account_balance - $1 WHERE id = $2",
            values: [amount, from_account_id]
        });

        await pool.query({
            text: "UPDATE tblaccount SET account_balance = account_balance + $1 WHERE id = $2",
            values: [amount, to_account_id]
        });

        await pool.query({
            text: "INSERT INTO tbltransaction (user_id, amount, description, source, status, type) VALUES ($1, $2, $3, $4, $5, $6)",
            values: [userId, amount, `Transfer to ${destAccount.account_name}`, sourceAccount.account_name, 'completed', 'expense']
        });
        
        await pool.query({
            text: "INSERT INTO tbltransaction (user_id, amount, description, source, status, type) VALUES ($1, $2, $3, $4, $5, $6)",
            values: [userId, amount, `Transfer from ${sourceAccount.account_name}`, destAccount.account_name, 'completed', 'income']
        });

        await pool.query('COMMIT');

        return NextResponse.json({ message: "Transfer successful" }, { status: 200 });

    } catch (error) {
        await pool.query('ROLLBACK');
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
