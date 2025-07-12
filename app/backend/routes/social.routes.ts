import { Router } from 'express';
import { socialController } from '../controllers/social.controller';

const router = Router();

/**
 * @route GET /api/social/rank/:handle
 * @description Get ranking for a TikTok profile
 * @access Public
 */
router.get('/rank/:handle', socialController.getProfileRanking);

/**
 * @route POST /api/social/rank
 * @description Calculate ranking for a TikTok profile (with full analysis)
 * @access Public
 */
router.post('/rank', socialController.calculateProfileRanking);

/**
 * @route POST /api/social/seed-accounts/manage
 * @description Add or remove a profile from seed accounts list
 * @access Public
 */
router.post('/seed-accounts/manage', socialController.manageSeedAccount);

/**
 * @route GET /api/social/seed-accounts
 * @description Get list of all seed accounts
 * @access Public
 */
router.get('/seed-accounts', socialController.getSeedAccounts);

/**
 * @route POST /api/social/trust-propagation/run
 * @description Run trust propagation iteration across all profiles
 * @access Public
 */
router.post('/trust-propagation/run', socialController.runTrustPropagation);

/**
 * @route POST /api/social/trust-network/build
 * @description Build trust network from seed accounts
 * @access Public
 */
router.post('/trust-network/build', socialController.buildTrustNetwork);

/**
 * @route GET /api/social/trust-network/stats
 * @description Get trust network statistics
 * @access Public
 */
router.get('/trust-network/stats', socialController.getTrustNetworkStats);

/**
 * @route GET /api/social/leaderboard
 * @description Get ranked leaderboard of TikTok profiles
 * @access Public
 */
router.get('/leaderboard', socialController.getLeaderboard);

/**
 * @route GET /api/social/scraper/status
 * @description Check if the scraper service is configured and operational
 * @access Public
 */
router.get('/scraper/status', socialController.getScraperStatus);

/**
 * @route DELETE /api/social/cache/:handle
 * @description Clear cache for a specific profile
 * @access Public
 */
router.delete('/cache/:handle', socialController.clearProfileCache);

/**
 * @route DELETE /api/social/cache
 * @description Clear all scraper cache
 * @access Public
 */
router.delete('/cache', socialController.clearAllCache);

export default router;