import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { comparePassword, createJWT } from '@/lib/utils';

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        const result = await pool.query({
            text: "SELECT * FROM tbluser WHERE email = $1",
            values: [email],
        });
        
        const user = result.rows[0];
        if (!user) {
            return NextResponse.json({ message: "User not found." }, { status: 404 });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
        }

        const token = createJWT(user.id);
        delete user.password;

        return NextResponse.json({ user, token }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
