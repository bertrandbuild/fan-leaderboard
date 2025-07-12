import express from 'express';
import agentRoutes from './agent.routes';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import socialRoutes from './social.routes';
import userRoutes from './user.routes';
import yapRoutes from './yap.routes';
import campaignRoutes from './campaign.routes';

const router = express.Router();

router.use('/agents', agentRoutes);
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/social', socialRoutes);
router.use('/users', userRoutes);
router.use('/yaps', yapRoutes);
router.use('/campaigns', campaignRoutes);

export default router;
