import { pool } from "../libs/database.js";

export const getAccounts = async (req, res) => {
    try {   
        const { userId } = req.body.user;

        const accounts = await pool.query({
            text: "SELECT * FROM tblaccount WHERE user_id = $1",
            values: [userId]
        });
        res.status(200).json({
            status: "success", 
            data: accounts.rows
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createAccount = async (req, res) => {
    try {   

          const { userId } = req.body.user;

          const { name, amount, account_number} = req.body;

          const accountExistQuery = {
            text: "SELECT * FROM tblaccount WHERE account_name = $1 AND user_id = $2",
            values: [name, userId]
          };

          const accountExistResult = await pool.query(accountExistQuery);

          const accountExist = accountExistResult.rows[0];

            if (accountExist) { 
                return  res.status(400).json({ message: "Account with this name already exists." });
            }

          const createAccountResult = await pool.query({
            text: "INSERT INTO tblaccount (user_id,account_name, account_number, account_balance) VALUES ($1, $2, $3, $4) RETURNING *",
            values: [userId, name, account_number, amount]
          });  

          const account = createAccountResult.rows[0];

          const userAccounts = Array.isArray(name) ? name : [name];

          const updateUserAccountsQuery = {
            text: "UPDATE tbluser SET accounts = array_cat(accounts, $1), updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            values: [userAccounts, userId]
          };

          await pool.query(updateUserAccountsQuery);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addMoneyToAccount = async (req, res) => {
    try {   
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};