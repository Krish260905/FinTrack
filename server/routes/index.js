import express from 'express';
// import accountRoutes from './accountRoutes.js';
// import transactionRoutes from './transactionRoutes.js';
import authRoutes from './authRoutes.js';
// import userRoutes from './userRoutes.js';
const router = express.Router();

router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/accounts', accountRoutes);
// router.use('/transactions', transactionRoutes);

export default router;