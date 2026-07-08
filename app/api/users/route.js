import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { comparePassword, hashPassword } from '@/lib/utils';

export async function GET(req) {
    try {
        const userId = getAuthenticatedUser(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const userExist = await pool.query({
            text: "SELECT * FROM tbluser WHERE id = $1",
            values: [userId]
        });

        const user = userExist.rows[0];
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        delete user.password;
        return NextResponse.json({ user }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const userId = getAuthenticatedUser(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { firstname, lastname, country, currency, contact } = await req.json();

        const userExist = await pool.query({
            text: "SELECT * FROM tbluser WHERE id = $1",
            values: [userId]
        });

        const user = userExist.rows[0];
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const updatedUser = await pool.query({
            text: "UPDATE tbluser SET firstname = $1, lastname = $2, country = $3, currency = $4, contact = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *",
            values: [firstname || user.firstname, lastname || user.lastname, country || user.country, currency || user.currency, contact || user.contact, userId]
        });

        delete updatedUser.rows[0].password;

        return NextResponse.json({
            message: "User updated successfully",
            user: updatedUser.rows[0] 
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
