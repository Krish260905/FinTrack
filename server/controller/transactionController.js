import { pool } from "../libs/database";

export const getTransactions = async (req, res) => {
    try {   

        const today = new Date();

        const _sevenDaysAgo = new Date(today);
        _sevenDaysAgo.setDate(today.getDate() - 7);
        const sevenDaysAgo = _sevenDaysAgo.toISOString().split('T')[0];

        const {df,dt,s} = req.query;

        const { userId } = req.body.userId;

        const startDate = new Date(df || sevenDaysAgo);
        const endDate = new Date(dt || new Date());

        const transactions = await pool.query({
            text: `SELECT * FROM tbltransaction WHERE user_id = $1 AND created_at BETWEEN $2 AND $3 AND (description ILIKE '%' || $4 || '%' OR status ILIKE '%' || $4 || '%' OR source ILIKE '%' || $4 || '%') ORDER BY id DESC`, 
            values: [userId, startDate, endDate, s]
        });

        res.status(200).json({ 
            status : 'success',
            data: transactions.rows });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDashboardInformation = async (req, res) => {
    try {   
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addTransaction = async (req, res) => {
    try {   

        const { userId } = req.body.user;
        const { account_id } = req.params;
        const { amount, description, source } = req.body;

        if(!amount || !description || !source) {
            return res.status(400).json({ message: "All fields are required" });
        }
            

        if (number(amount) <= 0) {
            return res.status(400).json({ message: "Amount must be greater than zero" });
        }

         const result = await pool.query({
            text : `SELECT * FROM tblaccount WHERE id = $1 `,
            values: [account_id]
        });

        const accountInfo = result.rows[0];

        if (!accountInfo) {
            return res.status(404).json({ message: "Account not found" });
        }

        if (accountInfo.account_balance <= 0 || accountInfo.account_balance < Number(amount)) {
            return res.status(400).json({ message: "Insufficient account balance" });
        }

        await pool.query('BEGIN');
           await pool.query({
            text : `UPDATE tblaccount SET account_balance = account_balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
            values: [amount, account_id]
        });

        await pool.query({
            text : `INSERT INTO tbltransaction (user_id, amount, description, source, status, type) VALUES ($1, $2, $3, $4, $5, $6)`,
            values: [userId, amount, description, source, 'completed','expense']
        });

        await pool.query('COMMIT');

        res.status(201).json({ message: "Transaction added successfully" });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const transferMoneyToAccount = async (req, res) => {
    try {   
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};