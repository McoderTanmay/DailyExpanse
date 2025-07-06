import express from 'express';
import { getFinanceData, addFinanceData, updateFinanceData, deleteFinanceData, getMonthlyFinanceData, getDashboardData } from '../controllers/financeController.js';

const router = express.Router();

router.get('/finance', getFinanceData);
router.post('/finance', addFinanceData);
router.put('/finance/:id', updateFinanceData);
router.delete('/finance/:id', deleteFinanceData);
router.get('/monthly-finance', getMonthlyFinanceData);
router.get('/dashboard', getDashboardData);

export default router;