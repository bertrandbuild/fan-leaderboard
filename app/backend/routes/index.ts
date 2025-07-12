import express from 'express';
import agentRoutes from './agent.routes';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import socialRoutes from './social.routes';

const router = express.Router();

router.use('/agents', agentRoutes);
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/social', socialRoutes);

export default router;
