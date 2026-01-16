import { pool } from "../libs/database.js";
import { hashPassword } from "../libs/index.js";

export const signupUser = async (req, res) => {
    try {
        const { firstName, email, password } = req.body;

        if (!firstName || !email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const userExist = await pool.query({
            text: "SELECT EXISTS (SELECT * FROM tbluser WHERE email = $1)",
            values: [email],
        })

        if (userExist.rows[0].userExist) {
            return  res.status(409).json({ message: "User already exists." });
        }

        const hashedPassword = await hashPassword(password);

        const user = await pool.query({
            text: "INSERT INTO tbluser (firstname, email, password) VALUES ($1, $2, $3) RETURNING *",
            values: [firstName, email, hashedPassword],
        });

        user.rows[0].password = undefined;
        res.status(201).json({ user: user.rows[0] });


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const signinUser = async (req, res) => {
    try {   
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// export const signinUser = async (req, res) => {
//     try {   
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };