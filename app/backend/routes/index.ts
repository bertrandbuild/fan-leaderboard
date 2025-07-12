import express from 'express';
import agentRoutes from './agent.routes';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

const router = express.Router();

router.use('/agents', agentRoutes);
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
