import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req) {
    try {
        const userId = getAuthenticatedUser(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const timeframe = searchParams.get('timeframe') || 'monthly'; // 'monthly' or 'yearly'
        const paramYear = searchParams.get('year');
        const paramMonth = searchParams.get('month');

        const y = parseInt(paramYear) || new Date().getFullYear();
        let m = new Date().getMonth() + 1;
        if (timeframe === 'monthly' && paramMonth) {
            m = parseInt(paramMonth) || m;
        }

        // 1. Account Balance (All time)
        const accResult = await pool.query('SELECT SUM(account_balance) as total FROM tblaccount WHERE user_id = $1', [userId]);
        const totalBalance = accResult.rows[0].total || 0;

        // 2. Investment (Aggregated All time)
        const invResult = await pool.query('SELECT SUM(total_amount) as total_amount, SUM(growth_amount) as growth_amount FROM tblinvestment WHERE user_id = $1', [userId]);
        const investment = { 
            total_amount: invResult.rows[0].total_amount || 0, 
            growth_amount: invResult.rows[0].growth_amount || 0 
        };

        // 3. Goals (Most recent or active All time)
        const goalResult = await pool.query('SELECT * FROM tblgoal WHERE user_id = $1 ORDER BY id DESC LIMIT 1', [userId]);
        const goal = goalResult.rows[0] || null;

        // --- FILTERED QUERIES ---

        let dateFilter = '';
        let queryParams = [userId];

        if (timeframe === 'yearly') {
            dateFilter = `AND extract(year from created_at) = $2`;
            queryParams.push(y);
        } else {
            dateFilter = `AND extract(year from created_at) = $2 AND extract(month from created_at) = $3`;
            queryParams.push(y, m);
        }

        // 4. Expenses (Filtered)
        const expResult = await pool.query(`
            SELECT SUM(amount) as total 
            FROM tbltransaction 
            WHERE user_id = $1 AND type = 'expense' ${dateFilter}
        `, queryParams);
        const filteredExpense = expResult.rows[0].total || 0;

        // 5. Recent Expenses (Filtered)
        const recentResult = await pool.query(`
            SELECT * FROM tbltransaction 
            WHERE user_id = $1 AND type = 'expense' ${dateFilter}
            ORDER BY created_at DESC LIMIT 5
        `, queryParams);

        // 6. Top Categories for Donut (Filtered)
        const catResult = await pool.query(`
            SELECT category, SUM(amount) as value
            FROM tbltransaction
            WHERE user_id = $1 AND type = 'expense' ${dateFilter}
            GROUP BY category
            ORDER BY value DESC
            LIMIT 5
        `, queryParams);
        
        const topCategories = catResult.rows.map(r => ({ category: r.category, value: Number(r.value) }));

        // 7. Bar Chart (Logic depends on timeframe)
        let chartDateFilter = '';
        let chartParams = [userId];

        if (timeframe === 'yearly') {
            chartDateFilter = `AND extract(year from created_at) = $2`;
            chartParams.push(y);
        } else {
            // For monthly, show last 6 months ending on the selected month/year
            const targetDateStr = `${y}-${m.toString().padStart(2, '0')}-01`;
            chartDateFilter = `AND created_at >= '${targetDateStr}'::date - INTERVAL '5 months' AND created_at < '${targetDateStr}'::date + INTERVAL '1 month'`;
        }

        const chartResult = await pool.query(`
            SELECT 
                to_char(created_at, 'Mon') as name,
                SUM(amount) as value,
                min(created_at) as sort_date
            FROM tbltransaction
            WHERE user_id = $1 AND type = 'expense' ${chartDateFilter}
            GROUP BY to_char(created_at, 'Mon')
            ORDER BY sort_date ASC
        `, chartParams);
        
        let chartData = chartResult.rows.map(r => ({ name: r.name, value: Number(r.value) }));
        
        // Fill in dummy data if empty so the chart doesn't look completely broken for new users
        if (chartData.length === 0) {
            chartData = [
                { name: 'Jan', value: 0 }, { name: 'Feb', value: 0 }, { name: 'Mar', value: 0 },
                { name: 'Apr', value: 0 }, { name: 'May', value: 0 }, { name: 'Jun', value: 0 },
            ];
        }

        // 8. Subscriptions (Filtered by timeframe)
        let subDateFilter = '';
        if (timeframe === 'yearly') {
            subDateFilter = `AND extract(year from next_date) = $2`;
        } else {
            subDateFilter = `AND extract(year from next_date) = $2 AND extract(month from next_date) = $3`;
        }

        const subResult = await pool.query(`
            SELECT * FROM tblsubscription 
            WHERE user_id = $1 ${subDateFilter} 
            ORDER BY next_date ASC
        `, queryParams);

        return NextResponse.json({
            accountBalance: totalBalance,
            monthlyExpense: filteredExpense, // Kept the key name same to minimize frontend breaking
            investment: investment,
            goal: goal,
            recentExpenses: recentResult.rows,
            topCategories: topCategories,
            monthlyChart: chartData,
            subscriptions: subResult.rows
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
