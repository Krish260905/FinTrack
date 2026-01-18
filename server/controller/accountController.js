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

          const description = account.account_name + "(initial deposit)";

          await pool.query({
            text: "INSERT INTO tbltransaction (user_id, amount, description, type, status, source) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            values: [userId, amount, description, 'income',"completed",account.account_name]
          });

            res.status(201).json({
                status: "success", 
                data: account,
                message: "Account created successfully."
            });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addMoneyToAccount = async (req, res) => {
    try {   

        const { userId } = req.body.user;
        const { id } = req.params;
        const { amount } = req.body;

        const newAccount = Number(amount);

        const result = await pool.query({
            text: "UPDATE tblaccount SET account_balance = (account_balance + $1), updated_at = CURRENT_TIMESTAMP WHERE id = $2  RETURNING *",
            values: [newAccount, id,]
        });

        const accountInfo = result.rows[0];

        const description = accountInfo.account_name + "(deposit)";

        const transQuery = {
            text: "INSERT INTO tbltransaction (user_id, amount, description, type, status, source) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            values: [userId, amount, description, 'income',"completed",accountInfo.account_name]
        };

        await pool.query(transQuery);

        res.status(200).json({
            status: "success", 
            data: accountInfo,
            message: "Amount added successfully."
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};