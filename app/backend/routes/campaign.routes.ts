import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller';
import { authenticate } from '../middlewares/auth.middleware';
import {
  campaignCreateSchema,
  campaignUpdateSchema,
  campaignQuerySchema,
  campaignIdParamSchema,
  userIdParamSchema,
} from '../middlewares/campaign.schema';

const router = Router();

/**
 * @route POST /api/campaigns
 * @description Create a new campaign (club admin only)
 * @access Private (club admin)
 */
router.post(
  '/',
  authenticate,
  campaignCreateSchema,
  campaignController.createCampaign
);

/**
 * @route GET /api/campaigns
 * @description List campaigns with optional filters
 * @access Public
 */
router.get(
  '/',
  campaignController.listCampaigns
);

/**
 * @route GET /api/campaigns/:id
 * @description Get campaign details
 * @access Public
 */
router.get(
  '/:id',
  campaignIdParamSchema,
  campaignController.getCampaign
);

/**
 * @route PUT /api/campaigns/:id
 * @description Update campaign (admin only)
 * @access Private (campaign owner)
 */
router.put(
  '/:id',
  authenticate,
  campaignIdParamSchema,
  campaignUpdateSchema,
  campaignController.updateCampaign
);

/**
 * @route DELETE /api/campaigns/:id
 * @description Delete campaign (admin only)
 * @access Private (campaign owner)
 */
router.delete(
  '/:id',
  authenticate,
  campaignIdParamSchema,
  campaignController.deleteCampaign
);

/**
 * @route POST /api/campaigns/:id/join
 * @description Join a campaign
 * @access Private (authenticated users)
 */
router.post(
  '/:id/join',
  authenticate,
  campaignIdParamSchema,
  campaignController.joinCampaign
);

/**
 * @route POST /api/campaigns/:id/activate
 * @description Activate a campaign (admin only)
 * @access Private (campaign owner)
 */
router.post(
  '/:id/activate',
  authenticate,
  campaignIdParamSchema,
  campaignController.activateCampaign
);

/**
 * @route POST /api/campaigns/:id/complete
 * @description Complete a campaign and distribute rewards (admin only)
 * @access Private (campaign owner)
 */
router.post(
  '/:id/complete',
  authenticate,
  campaignIdParamSchema,
  campaignController.completeCampaign
);

/**
 * @route GET /api/campaigns/:id/leaderboard
 * @description Get campaign leaderboard
 * @access Public
 */
router.get(
  '/:id/leaderboard',
  campaignIdParamSchema,
  campaignController.getCampaignLeaderboard
);

/**
 * @route GET /api/campaigns/:id/participants
 * @description Get all campaign participants
 * @access Public
 */
router.get(
  '/:id/participants',
  campaignIdParamSchema,
  campaignController.getCampaignParticipants
);

/**
 * @route GET /api/campaigns/:id/stats
 * @description Get campaign statistics
 * @access Public
 */
router.get(
  '/:id/stats',
  campaignIdParamSchema,
  campaignController.getCampaignStats
);

/**
 * @route GET /api/users/:userId/campaigns
 * @description Get user's campaigns (both created and participated)
 * @access Public
 */
router.get(
  '/users/:userId/campaigns',
  userIdParamSchema,
  campaignController.getUserCampaigns
);

export default router; 