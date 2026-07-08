import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req) {
    try {
        const userId = getAuthenticatedUser(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const accounts = await pool.query({
            text: "SELECT * FROM tblaccount WHERE user_id = $1",
            values: [userId]
        });

        return NextResponse.json({
            status: "success", 
            data: accounts.rows
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const userId = getAuthenticatedUser(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { name, amount, account_number } = await req.json();

        const accountExistResult = await pool.query({
            text: "SELECT * FROM tblaccount WHERE account_name = $1 AND user_id = $2",
            values: [name, userId]
        });

        if (accountExistResult.rows[0]) {
            return NextResponse.json({ message: "Account with this name already exists." }, { status: 400 });
        }

        const createAccountResult = await pool.query({
            text: "INSERT INTO tblaccount (user_id, account_name, account_number, account_balance) VALUES ($1, $2, $3, $4) RETURNING *",
            values: [userId, name, account_number, amount]
        });  

        const account = createAccountResult.rows[0];

        const description = account.account_name + " (initial deposit)";

        await pool.query({
            text: "INSERT INTO tbltransaction (user_id, amount, description, type, status, source) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            values: [userId, amount, description, 'income', "completed", account.account_name]
        });

        return NextResponse.json({
            status: "success", 
            data: account,
            message: "Account created successfully."
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
