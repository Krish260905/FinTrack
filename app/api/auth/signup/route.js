import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/utils';

export async function POST(req) {
    try {
        const { firstName, email, password } = await req.json();

        if (!firstName || !email || !password) {
            return NextResponse.json({ message: "All fields are required." }, { status: 400 });
        }

        const userExist = await pool.query({
            text: "SELECT EXISTS (SELECT * FROM tbluser WHERE email = $1)",
            values: [email],
        });

        if (userExist.rows[0].exists) {
            return NextResponse.json({ message: "User already exists." }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);

        const user = await pool.query({
            text: "INSERT INTO tbluser (firstname, email, password) VALUES ($1, $2, $3) RETURNING *",
            values: [firstName, email, hashedPassword],
        });

        const userData = user.rows[0];
        delete userData.password;
        
        return NextResponse.json({ user: userData }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
