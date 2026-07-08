import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(req, { params }) {
    try {
        const userId = getAuthenticatedUser(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        
        const { id } = await params;
        const { amount } = await req.json();

        const newAmount = Number(amount);

        const result = await pool.query({
            text: "UPDATE tblaccount SET account_balance = (account_balance + $1), updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *",
            values: [newAmount, id, userId]
        });

        const accountInfo = result.rows[0];

        if (!accountInfo) {
            return NextResponse.json({ message: "Account not found" }, { status: 404 });
        }

        const description = accountInfo.account_name + " (deposit)";

        await pool.query({
            text: "INSERT INTO tbltransaction (user_id, amount, description, type, status, source) VALUES ($1, $2, $3, $4, $5, $6)",
            values: [userId, amount, description, 'income', "completed", accountInfo.account_name]
        });

        return NextResponse.json({
            status: "success", 
            data: accountInfo,
            message: "Amount added successfully."
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
