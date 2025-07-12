import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller';
import { 
  completeCampaignWithBlockchain, 
  getClaimableRewards, 
  getCampaignContractAddress 
} from '../controllers/campaign.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { 
  campaignCreateSchema, 
  campaignUpdateSchema, 
  campaignIdParamSchema,
  userIdParamSchema
} from '../middlewares/campaign.schema';

const router = Router();

/**
 * @route POST /api/campaigns
 * @description Create a new campaign
 * @access Club Admin
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
 * @description Update a campaign
 * @access Club Admin
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
 * @description Delete a campaign
 * @access Club Admin
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
 * @access User
 */
router.post(
  '/:id/join',
  authenticate,
  campaignIdParamSchema,
  campaignController.joinCampaign
);

/**
 * @route POST /api/campaigns/:id/activate
 * @description Activate a campaign
 * @access Club Admin
 */
router.post(
  '/:id/activate',
  authenticate,
  campaignIdParamSchema,
  campaignController.activateCampaign
);

/**
 * @route POST /api/campaigns/:id/complete
 * @description Complete a campaign
 * @access Club Admin
 */
router.post(
  '/:id/complete',
  authenticate,
  campaignIdParamSchema,
  campaignController.completeCampaign
);

/**
 * @route POST /api/campaigns/:id/complete-blockchain
 * @description Complete campaign and deploy to blockchain
 * @access Club Admin
 */
router.post(
  '/:id/complete-blockchain',
  campaignIdParamSchema,
  authenticate,
  completeCampaignWithBlockchain
);

/**
 * @route GET /api/campaigns/:id/claimable/:userAddress
 * @description Get claimable rewards for a user
 * @access Public
 */
router.get(
  '/:id/claimable/:userAddress',
  getClaimableRewards
);

/**
 * @route GET /api/campaigns/:id/contract-address
 * @description Get campaign's blockchain contract address
 * @access Public
 */
router.get(
  '/:id/contract-address',
  getCampaignContractAddress
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