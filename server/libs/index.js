import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};

export const comparePassword = async (userPassword, hashedPassword) => {
    try {
        const isMatch = await bcrypt.compare(userPassword, hashedPassword);
        return isMatch;
        
    } catch (error) {
        console.error("Error comparing passwords:", error);
    }
};

export const createJWT = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
}; 
