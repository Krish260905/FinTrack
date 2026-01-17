import {pool} from "../libs/database.js";
import { comparePassword } from "../libs/index.js";

export const getUser = async (req, res) => {
    try {   
        const { userId } = req.body.user;

        const userExist = await pool.query({
            text: "SELECT * FROM tbluser WHERE id = $1",
            values: [userId]
        });

        const user = userExist.rows[0];

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.password = undefined;

        res.status(200).json({ user });


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const changePassword = async (req, res) => {
    try {   

        const { userId } = req.body.user;

        const{ currentPassword, newPassword, confirmPasseword } = req.body;

        const userExist = await pool.query({
            text: "SELECT * FROM tbluser WHERE id = $1",
            values: [userId]
        });

        const user = userExist.rows[0];

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (newPassword !== confirmPasseword) {
            return res.status(400).json({ message: "New password and confirm password do not match" });
        }

        const isMatch = await comparePassword(currentPassword, user?.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        const hashedPassword = await hashPassword(newPassword);

        await pool.query({
            text: "UPDATE tbluser SET password = $1 WHERE id = $2",
            values: [hashedPassword, userId]
        });

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } 
};

export const updateUser = async (req, res) => {
    try {   

        const { userId } = req.body.user;
        const { firstname, lastname, country, currency, contact } = req.body;

        const userExist = await pool.query({
            text: "SELECT * FROM tbluser WHERE id = $1",
            values: [userId]
        });

        const user = userExist.rows[0];

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const updatedUser = await pool.query({
            text: "UPDATE tbluser SET firstname = $1, lastname = $2, country = $3, currency = $4, contact = $5, updatedat = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *",
            values: [firstname || user.firstname, lastname || user.lastname, country || user.country, currency || user.currency, contact || user.contact, userId]
        });

        updatedUser.rows[0].password = undefined;

        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser.rows[0] 
        })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};