import { Router } from 'express';
import {
  calculateYapScoreEndpoint,
  processYapEndpoint,
  autoProcessYapEndpoint,
  batchProcessYapsEndpoint,
  getYapLeaderboardEndpoint,
  getYapsByProfileEndpoint,
  getYapProfileRankingEndpoint,
  getYapByIdEndpoint,
  getYapByUrlEndpoint,
  getYapInteractionsEndpoint,
  getInteractionsByProfileEndpoint,
  recalculateYapScoreEndpoint,
  deleteYapEndpoint,
  getYapStatsEndpoint,
  searchYapsByCreatorEndpoint,
  listYapsEndpoint,
  clearCacheEndpoint,
  clearVideoCacheEndpoint,
  getCacheStatsEndpoint,
  toggleCacheEndpoint,
} from '../controllers/yap.controller';

const router = Router();

// Public endpoints - no authentication required
router.get('/calculate', calculateYapScoreEndpoint);
router.get('/leaderboard', getYapLeaderboardEndpoint);
router.get('/profile-ranking', getYapProfileRankingEndpoint);
router.get('/stats', getYapStatsEndpoint);
router.get('/search', searchYapsByCreatorEndpoint);
router.get('/', listYapsEndpoint);

// Specific yap endpoints
router.get('/:id', getYapByIdEndpoint);
router.get('/url/:videoUrl', getYapByUrlEndpoint);
router.get('/:id/interactions', getYapInteractionsEndpoint);

// Profile-specific endpoints
router.get('/profile/:profileId', getYapsByProfileEndpoint);
router.get('/interactions/profile/:profileId', getInteractionsByProfileEndpoint);

// Admin/processing endpoints - these could be protected with authentication middleware
router.post('/process', processYapEndpoint);
router.post('/auto-process', autoProcessYapEndpoint);
router.post('/batch', batchProcessYapsEndpoint);
router.put('/:id/recalculate', recalculateYapScoreEndpoint);
router.delete('/:id', deleteYapEndpoint);

// Cache management endpoints
router.get('/cache/stats', getCacheStatsEndpoint);
router.delete('/cache', clearCacheEndpoint);
router.delete('/cache/video', clearVideoCacheEndpoint);
router.put('/cache/toggle', toggleCacheEndpoint);

export default router; 