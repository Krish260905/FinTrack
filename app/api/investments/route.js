import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req) {
    try {
        const userId = getAuthenticatedUser(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const investments = await pool.query({
            text: "SELECT * FROM tblinvestment WHERE user_id = $1 ORDER BY id DESC",
            values: [userId]
        });

        return NextResponse.json({
            status: "success", 
            data: investments.rows
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const userId = getAuthenticatedUser(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { asset_name, asset_type, total_amount, growth_amount } = await req.json();

        if (!asset_name || !asset_type || !total_amount) {
            return NextResponse.json({ message: "Asset name, type, and total amount are required." }, { status: 400 });
        }

        const createResult = await pool.query({
            text: "INSERT INTO tblinvestment (user_id, asset_name, asset_type, total_amount, growth_amount) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            values: [userId, asset_name, asset_type, total_amount, growth_amount || 0]
        });  

        return NextResponse.json({
            status: "success", 
            data: createResult.rows[0],
            message: "Investment added successfully."
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
