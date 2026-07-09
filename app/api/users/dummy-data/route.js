import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function DELETE(req) {
    const userId = getAuthenticatedUser(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Delete all data associated with the user
        await client.query('DELETE FROM tbltransaction WHERE user_id = $1', [userId]);
        await client.query('DELETE FROM tblsubscription WHERE user_id = $1', [userId]);
        await client.query('DELETE FROM tblgoal WHERE user_id = $1', [userId]);
        await client.query('DELETE FROM tblinvestment WHERE user_id = $1', [userId]);
        await client.query('DELETE FROM tblaccount WHERE user_id = $1', [userId]);
        
        // Update user flag
        const userRes = await client.query('UPDATE tbluser SET has_dummy_data = false WHERE id = $1 RETURNING *', [userId]);
        
        await client.query('COMMIT');

        const userData = userRes.rows[0];
        delete userData.password;

        return NextResponse.json({ 
            status: 'success',
            message: 'All dummy data has been successfully cleared.',
            user: userData
        }, { status: 200 });

    } catch (error) {
        await client.query('ROLLBACK');
        return NextResponse.json({ message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}
