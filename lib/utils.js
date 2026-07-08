import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

export const createJWT = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

export const verifyJWT = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};
