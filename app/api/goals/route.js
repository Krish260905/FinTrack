import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req) {
    try {
        const userId = getAuthenticatedUser(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const goals = await pool.query({
            text: "SELECT * FROM tblgoal WHERE user_id = $1 ORDER BY id DESC",
            values: [userId]
        });

        return NextResponse.json({
            status: "success", 
            data: goals.rows
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const userId = getAuthenticatedUser(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { name, target_amount, current_amount, accountId } = await req.json();

        if (!name || !target_amount) {
            return NextResponse.json({ message: "Name and target amount are required." }, { status: 400 });
        }

        const initialAmount = Number(current_amount) || 0;

        if (initialAmount > 0 && !accountId) {
            return NextResponse.json({ message: "An account must be selected to fund the initial amount." }, { status: 400 });
        }

        if (initialAmount > 0) {
            // Check account balance
            const accountResult = await pool.query('SELECT * FROM tblaccount WHERE id = $1 AND user_id = $2', [accountId, userId]);
            if (accountResult.rows.length === 0) {
                return NextResponse.json({ message: "Account not found." }, { status: 404 });
            }
            if (Number(accountResult.rows[0].account_balance) < initialAmount) {
                return NextResponse.json({ message: "Insufficient funds in the selected account." }, { status: 400 });
            }

            const client = await pool.connect();
            let createdGoal;
            try {
                await client.query('BEGIN');

                // Deduct from account
                await client.query(`
                    UPDATE tblaccount SET account_balance = account_balance - $1 WHERE id = $2
                `, [initialAmount, accountId]);

                // Create transaction
                await client.query(`
                    INSERT INTO tbltransaction (user_id, amount, description, type, status, source) 
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, [userId, initialAmount, `Funding for Goal: ${name}`, 'expense', 'completed', accountResult.rows[0].account_name]);

                // Create goal
                const createResult = await client.query(`
                    INSERT INTO tblgoal (user_id, name, target_amount, current_amount) VALUES ($1, $2, $3, $4) RETURNING *
                `, [userId, name, target_amount, initialAmount]);

                createdGoal = createResult.rows[0];

                await client.query('COMMIT');
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                client.release();
            }

            return NextResponse.json({
                status: "success", 
                data: createdGoal,
                message: "Goal created successfully."
            }, { status: 201 });
            
        } else {
            // No initial amount, just create goal
            const createResult = await pool.query({
                text: "INSERT INTO tblgoal (user_id, name, target_amount, current_amount) VALUES ($1, $2, $3, $4) RETURNING *",
                values: [userId, name, target_amount, 0]
            });  

            return NextResponse.json({
                status: "success", 
                data: createResult.rows[0],
                message: "Goal created successfully."
            }, { status: 201 });
        }

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const userId = getAuthenticatedUser(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { goal_id, amount, accountId } = await req.json();

        if (!goal_id || !amount || Number(amount) <= 0) {
            return NextResponse.json({ message: "Valid goal ID and amount are required." }, { status: 400 });
        }

        if (!accountId) {
            return NextResponse.json({ message: "An account must be selected to draw funds from." }, { status: 400 });
        }

        // Validate goal exists
        const goalResult = await pool.query('SELECT * FROM tblgoal WHERE id = $1 AND user_id = $2', [goal_id, userId]);
        if (goalResult.rows.length === 0) {
            return NextResponse.json({ message: "Goal not found." }, { status: 404 });
        }
        const goal = goalResult.rows[0];

        // Check account balance
        const accountResult = await pool.query('SELECT * FROM tblaccount WHERE id = $1 AND user_id = $2', [accountId, userId]);
        if (accountResult.rows.length === 0) {
            return NextResponse.json({ message: "Account not found." }, { status: 404 });
        }
        if (Number(accountResult.rows[0].account_balance) < Number(amount)) {
            return NextResponse.json({ message: "Insufficient funds in the selected account." }, { status: 400 });
        }

        const client = await pool.connect();
        let updatedGoal;
        try {
            await client.query('BEGIN');

            // Deduct from account
            await client.query(`
                UPDATE tblaccount SET account_balance = account_balance - $1 WHERE id = $2
            `, [amount, accountId]);

            // Create transaction
            await client.query(`
                INSERT INTO tbltransaction (user_id, amount, description, type, status, source) 
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [userId, amount, `Funding for Goal: ${goal.name}`, 'expense', 'completed', accountResult.rows[0].account_name]);

            // Update goal
            const updateResult = await client.query(`
                UPDATE tblgoal SET current_amount = current_amount + $1 WHERE id = $2 RETURNING *
            `, [amount, goal_id]);

            updatedGoal = updateResult.rows[0];

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

        return NextResponse.json({
            status: "success", 
            data: updatedGoal,
            message: "Funds added to goal successfully."
        }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
