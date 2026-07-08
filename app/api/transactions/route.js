import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req) {
    try {
        const userId = getAuthenticatedUser(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        
        const df = searchParams.get('df');
        const dt = searchParams.get('dt');
        const s = searchParams.get('s') || '';

        const today = new Date();
        const _sevenDaysAgo = new Date(today);
        _sevenDaysAgo.setDate(today.getDate() - 30); // Show last 30 days by default
        const thirtyDaysAgo = _sevenDaysAgo.toISOString().split('T')[0];

        const startDate = new Date(df || thirtyDaysAgo);
        const endDate = new Date(dt || new Date());

        const transactions = await pool.query({
            text: `SELECT * FROM tbltransaction WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3 AND (description ILIKE '%' || $4 || '%' OR status ILIKE '%' || $4 || '%' OR source ILIKE '%' || $4 || '%') ORDER BY created_at DESC, id DESC`, 
            values: [userId, startDate, endDate, s]
        });

        return NextResponse.json({ 
            status: 'success',
            data: transactions.rows 
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const userId = getAuthenticatedUser(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { account_id, amount, description, source, type, category, sub_category } = await req.json();

        if (!amount || !description || !account_id || !type) {
            return NextResponse.json({ message: "Amount, description, account, and type are required" }, { status: 400 });
        }
            
        if (Number(amount) <= 0) {
            return NextResponse.json({ message: "Amount must be greater than zero" }, { status: 400 });
        }

        const result = await pool.query({
            text: `SELECT * FROM tblaccount WHERE id = $1 AND user_id = $2`,
            values: [account_id, userId]
        });

        const accountInfo = result.rows[0];

        if (!accountInfo) {
            return NextResponse.json({ message: "Account not found" }, { status: 404 });
        }

        if (type === 'expense') {
            if (Number(accountInfo.account_balance) <= 0 || Number(accountInfo.account_balance) < Number(amount)) {
                return NextResponse.json({ message: "Insufficient account balance" }, { status: 400 });
            }
        }

        await pool.query('BEGIN');
        
        // Update account balance
        if (type === 'income') {
            await pool.query({
                text: `UPDATE tblaccount SET account_balance = account_balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
                values: [amount, account_id]
            });
        } else {
            await pool.query({
                text: `UPDATE tblaccount SET account_balance = account_balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
                values: [amount, account_id]
            });
        }

        // Create transaction record
        await pool.query({
            text: `INSERT INTO tbltransaction (user_id, amount, description, source, status, type, category, sub_category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            values: [userId, amount, description, source || accountInfo.account_name, 'completed', type, category || null, sub_category || null]
        });
        
        await pool.query('COMMIT');

        return NextResponse.json({ message: "Transaction added successfully" }, { status: 201 });
        
    } catch (error) {
        await pool.query('ROLLBACK');
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
