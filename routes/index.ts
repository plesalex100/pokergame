
// current path: /
import { Router } from 'express';
const router = Router();

import authRouter from './auth';
router.use('/api/auth', authRouter);

import tableRouter from './table';
router.use('/api/table', tableRouter);

import frontendRouter from './frontend';
router.use('/', frontendRouter);

export default router;