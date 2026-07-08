import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { comparePassword, hashPassword } from '@/lib/utils';

export async function PUT(req) {
    try {
        const userId = getAuthenticatedUser(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { currentPassword, newPassword, confirmPassword } = await req.json();

        const userExist = await pool.query({
            text: "SELECT * FROM tbluser WHERE id = $1",
            values: [userId]
        });

        const user = userExist.rows[0];
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json({ message: "New password and confirm password do not match" }, { status: 400 });
        }

        const isMatch = await comparePassword(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
        }

        const hashedNewPassword = await hashPassword(newPassword);

        await pool.query({
            text: "UPDATE tbluser SET password = $1 WHERE id = $2",
            values: [hashedNewPassword, userId]
        });

        return NextResponse.json({ message: "Password changed successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    } 
}
