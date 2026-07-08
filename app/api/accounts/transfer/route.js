import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(req) {
    try {
        const userId = getAuthenticatedUser(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { fromAccountId, toAccountId, amount } = await req.json();

        if (!fromAccountId || !toAccountId || !amount || isNaN(amount) || amount <= 0) {
            return NextResponse.json({ message: "Invalid parameters" }, { status: 400 });
        }

        if (fromAccountId === toAccountId) {
            return NextResponse.json({ message: "Cannot transfer to the same account" }, { status: 400 });
        }

        // Get both accounts and verify ownership
        const accountsResult = await pool.query('SELECT * FROM tblaccount WHERE id IN ($1, $2) AND user_id = $3', [fromAccountId, toAccountId, userId]);
        if (accountsResult.rows.length !== 2) {
            return NextResponse.json({ message: "One or both accounts not found" }, { status: 404 });
        }

        const fromAccount = accountsResult.rows.find(a => Number(a.id) === Number(fromAccountId));
        const toAccount = accountsResult.rows.find(a => Number(a.id) === Number(toAccountId));

        if (Number(fromAccount.account_balance) < Number(amount)) {
            return NextResponse.json({ message: "Insufficient funds in source account" }, { status: 400 });
        }

        // We should ideally do this in a transaction, but since we are using pool.query directly and not managing a client,
        // we'll execute sequentially. In production, use client = await pool.connect(); client.query('BEGIN'); ... client.query('COMMIT');
        
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Deduct from fromAccount
            await client.query(`
                UPDATE tblaccount 
                SET account_balance = account_balance - $1
                WHERE id = $2 AND user_id = $3
            `, [amount, fromAccountId, userId]);

            // 2. Add to toAccount
            await client.query(`
                UPDATE tblaccount 
                SET account_balance = account_balance + $1
                WHERE id = $2 AND user_id = $3
            `, [amount, toAccountId, userId]);

            // 3. Insert Expense Transaction for fromAccount
            await client.query(`
                INSERT INTO tbltransaction (user_id, amount, description, type, status, source) 
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [userId, amount, `Transfer to ${toAccount.account_name}`, 'expense', 'completed', fromAccount.account_name]);

            // 4. Insert Income Transaction for toAccount
            await client.query(`
                INSERT INTO tbltransaction (user_id, amount, description, type, status, source) 
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [userId, amount, `Transfer from ${fromAccount.account_name}`, 'income', 'completed', toAccount.account_name]);

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

        return NextResponse.json({
            status: "success", 
            message: "Transfer completed successfully."
        }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
