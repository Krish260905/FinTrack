import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function DELETE(req, { params }) {
    try {
        const userId = getAuthenticatedUser(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        
        // params is a promise in Next.js 15+, we should await it if necessary or just use it.
        // It's safe to await params.
        const { id } = await params;

        // Delete account
        await pool.query({
            text: "DELETE FROM tblaccount WHERE id = $1 AND user_id = $2",
            values: [id, userId]
        });

        return NextResponse.json({ message: "Account deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
