import { Request, Response } from 'express';
import {
  calculateYapScore,
  processAndStoreYap,
  autoProcessYap,
  batchProcessYaps,
  getYapLeaderboard,
  recalculateYapScore,
  cacheUtils,
} from '../services/yap-service';
import {
  listYaps,
  getYapById,
  getYapByVideoUrl,
  deleteYap,
  getYapStats,
  getYapsByProfileRanking,
  getYapInteractions,
  getYapInteractionsByProfile,
  getTikTokProfileByHandle,
} from '../database/db';

/**
 * GET /api/yaps/calculate
 * Calculate yap score for a video without storing it
 */
export const calculateYapScoreEndpoint = async (req: Request, res: Response) => {
  try {
    const { videoUrl } = req.query;
    console.log('[YAP CONTROLLER] calculateYapScoreEndpoint called');
    console.log('[YAP CONTROLLER] videoUrl:', videoUrl);
    console.log('[YAP CONTROLLER] req.query:', req.query);

    if (!videoUrl || typeof videoUrl !== 'string') {
      console.log('[YAP CONTROLLER] Invalid videoUrl - missing or wrong type');
      return res.status(400).json({
        error: 'Video URL is required',
      });
    }

    console.log('[YAP CONTROLLER] Calling calculateYapScore service with URL:', videoUrl);
    const yapScore = await calculateYapScore(videoUrl);
    console.log('[YAP CONTROLLER] YAP score calculated successfully:', yapScore);

    res.json({
      success: true,
      data: yapScore,
    });
  } catch (error) {
    console.error('[YAP CONTROLLER] Error calculating yap score:', error);
    console.error('[YAP CONTROLLER] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      error: 'Failed to calculate yap score',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * POST /api/yaps/process
 * Process and store a yap if it qualifies
 */
export const processYapEndpoint = async (req: Request, res: Response) => {
  try {
    const { videoUrl, profileId } = req.body;

    if (!videoUrl || typeof videoUrl !== 'string') {
      return res.status(400).json({
        error: 'Video URL is required',
      });
    }

    const result = await processAndStoreYap(videoUrl, profileId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error processing yap:', error);
    res.status(500).json({
      error: 'Failed to process yap',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * POST /api/yaps/auto-process
 * Auto-detect creator and process yap (simplified version)
 */
export const autoProcessYapEndpoint = async (req: Request, res: Response) => {
  try {
    const { videoUrl } = req.body;

    if (!videoUrl || typeof videoUrl !== 'string') {
      return res.status(400).json({
        error: 'Video URL is required',
      });
    }

    const result = await autoProcessYap(videoUrl);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error auto-processing yap:', error);
    res.status(500).json({
      error: 'Failed to auto-process yap',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * POST /api/yaps/batch
 * Process multiple videos in batch
 */
export const batchProcessYapsEndpoint = async (req: Request, res: Response) => {
  try {
    const { videoUrls, profileId, maxConcurrent = 3 } = req.body;

    if (!videoUrls || !Array.isArray(videoUrls) || videoUrls.length === 0) {
      return res.status(400).json({
        error: 'Video URLs array is required',
      });
    }

    if (videoUrls.length > 50) {
      return res.status(400).json({
        error: 'Maximum 50 videos per batch',
      });
    }

    const results = await batchProcessYaps(videoUrls, profileId, maxConcurrent);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error batch processing yaps:', error);
    res.status(500).json({
      error: 'Failed to batch process yaps',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/yaps/leaderboard
 * Get top yaps sorted by score
 */
export const getYapLeaderboardEndpoint = async (req: Request, res: Response) => {
  try {
    const { limit = 50 } = req.query;
    const limitNum = parseInt(limit as string, 10);

    if (limitNum > 200) {
      return res.status(400).json({
        error: 'Maximum limit is 200',
      });
    }

    const yaps = getYapLeaderboard(limitNum);

    res.json({
      success: true,
      data: yaps,
    });
  } catch (error) {
    console.error('Error getting yap leaderboard:', error);
    res.status(500).json({
      error: 'Failed to get yap leaderboard',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/yaps/profile/:profileId
 * Get yaps for a specific profile
 */
export const getYapsByProfileEndpoint = async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const yaps = listYaps(profileId);

    res.json({
      success: true,
      data: yaps,
    });
  } catch (error) {
    console.error('Error getting yaps by profile:', error);
    res.status(500).json({
      error: 'Failed to get yaps by profile',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/yaps/profile-ranking
 * Get profiles ranked by their yap performance
 */
export const getYapProfileRankingEndpoint = async (req: Request, res: Response) => {
  try {
    const { limit = 100 } = req.query;
    const limitNum = parseInt(limit as string, 10);

    if (limitNum > 500) {
      return res.status(400).json({
        error: 'Maximum limit is 500',
      });
    }

    const ranking = getYapsByProfileRanking(limitNum);

    res.json({
      success: true,
      data: ranking,
    });
  } catch (error) {
    console.error('Error getting yap profile ranking:', error);
    res.status(500).json({
      error: 'Failed to get yap profile ranking',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/yaps/:id
 * Get yap by ID
 */
export const getYapByIdEndpoint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const yap = getYapById(id);

    if (!yap) {
      return res.status(404).json({
        error: 'Yap not found',
      });
    }

    res.json({
      success: true,
      data: yap,
    });
  } catch (error) {
    console.error('Error getting yap by ID:', error);
    res.status(500).json({
      error: 'Failed to get yap',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/yaps/url/:videoUrl
 * Get yap by video URL
 */
export const getYapByUrlEndpoint = async (req: Request, res: Response) => {
  try {
    const { videoUrl } = req.params;
    const decodedUrl = decodeURIComponent(videoUrl);
    const yap = getYapByVideoUrl(decodedUrl);

    if (!yap) {
      return res.status(404).json({
        error: 'Yap not found for this video URL',
      });
    }

    res.json({
      success: true,
      data: yap,
    });
  } catch (error) {
    console.error('Error getting yap by URL:', error);
    res.status(500).json({
      error: 'Failed to get yap',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/yaps/:id/interactions
 * Get interactions for a specific yap
 */
export const getYapInteractionsEndpoint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const interactions = getYapInteractions(id);

    res.json({
      success: true,
      data: interactions,
    });
  } catch (error) {
    console.error('Error getting yap interactions:', error);
    res.status(500).json({
      error: 'Failed to get yap interactions',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/yaps/interactions/profile/:profileId
 * Get interactions by profile
 */
export const getInteractionsByProfileEndpoint = async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const interactions = getYapInteractionsByProfile(profileId);

    res.json({
      success: true,
      data: interactions,
    });
  } catch (error) {
    console.error('Error getting interactions by profile:', error);
    res.status(500).json({
      error: 'Failed to get interactions by profile',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * PUT /api/yaps/:id/recalculate
 * Recalculate yap score
 */
export const recalculateYapScoreEndpoint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const newScore = await recalculateYapScore(id);

    res.json({
      success: true,
      data: newScore,
    });
  } catch (error) {
    console.error('Error recalculating yap score:', error);
    res.status(500).json({
      error: 'Failed to recalculate yap score',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * DELETE /api/yaps/:id
 * Delete yap
 */
export const deleteYapEndpoint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const yap = getYapById(id);
    if (!yap) {
      return res.status(404).json({
        error: 'Yap not found',
      });
    }

    deleteYap(id);

    res.json({
      success: true,
      message: 'Yap deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting yap:', error);
    res.status(500).json({
      error: 'Failed to delete yap',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/yaps/stats
 * Get yap statistics
 */
export const getYapStatsEndpoint = async (req: Request, res: Response) => {
  try {
    const stats = getYapStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting yap stats:', error);
    res.status(500).json({
      error: 'Failed to get yap stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/yaps/search
 * Search yaps by creator username
 */
export const searchYapsByCreatorEndpoint = async (req: Request, res: Response) => {
  try {
    const { username } = req.query;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({
        error: 'Username is required',
      });
    }

    const profile = getTikTokProfileByHandle(username);
    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
      });
    }

    const yaps = listYaps(profile.id);

    res.json({
      success: true,
      data: {
        profile: {
          id: profile.id,
          username: profile.unique_id,
          nickname: profile.nickname,
          rank_score: profile.rank_score,
        },
        yaps,
      },
    });
  } catch (error) {
    console.error('Error searching yaps by creator:', error);
    res.status(500).json({
      error: 'Failed to search yaps by creator',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/yaps
 * List all yaps with optional filtering
 */
export const listYapsEndpoint = async (req: Request, res: Response) => {
  try {
    const { profileId, limit = 100, offset = 0 } = req.query;
    
    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);

    if (limitNum > 200) {
      return res.status(400).json({
        error: 'Maximum limit is 200',
      });
    }

    const yaps = listYaps(profileId as string);
    const paginatedYaps = yaps.slice(offsetNum, offsetNum + limitNum);

    res.json({
      success: true,
      data: {
        yaps: paginatedYaps,
        total: yaps.length,
        limit: limitNum,
        offset: offsetNum,
      },
    });
  } catch (error) {
    console.error('Error listing yaps:', error);
    res.status(500).json({
      error: 'Failed to list yaps',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * DELETE /api/yaps/cache
 * Clear all cached comments
 */
export const clearCacheEndpoint = async (req: Request, res: Response) => {
  try {
    cacheUtils.clearCache();

    res.json({
      success: true,
      message: 'Cache cleared successfully',
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * DELETE /api/yaps/cache/video
 * Clear cache for a specific video URL
 */
export const clearVideoCacheEndpoint = async (req: Request, res: Response) => {
  try {
    const { videoUrl } = req.body;

    if (!videoUrl || typeof videoUrl !== 'string') {
      return res.status(400).json({
        error: 'Video URL is required',
      });
    }

    const deleted = cacheUtils.clearVideoCache(videoUrl);

    res.json({
      success: true,
      message: deleted ? 'Video cache cleared successfully' : 'No cache found for this video',
      deleted,
    });
  } catch (error) {
    console.error('Error clearing video cache:', error);
    res.status(500).json({
      error: 'Failed to clear video cache',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/yaps/cache/stats
 * Get cache statistics
 */
export const getCacheStatsEndpoint = async (req: Request, res: Response) => {
  try {
    const stats = cacheUtils.getCacheStats();

    res.json({
      success: true,
      data: {
        ...stats,
        enabled: cacheUtils.isEnabled(),
      },
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({
      error: 'Failed to get cache stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * PUT /api/yaps/cache/toggle
 * Enable or disable caching
 */
export const toggleCacheEndpoint = async (req: Request, res: Response) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        error: 'Enabled must be a boolean value',
      });
    }

    cacheUtils.setEnabled(enabled);

    res.json({
      success: true,
      message: `Cache ${enabled ? 'enabled' : 'disabled'} successfully`,
      enabled,
    });
  } catch (error) {
    console.error('Error toggling cache:', error);
    res.status(500).json({
      error: 'Failed to toggle cache',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};