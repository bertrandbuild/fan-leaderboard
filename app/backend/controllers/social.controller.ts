import { Request, Response } from 'express';
import { socialRankingService } from '../services/social-ranking';
import { tikTokScraperService } from '../services/tiktok-scraper';
import {
  rankingRequestSchema,
  seedAccountManagementSchema,
  leaderboardQuerySchema,
  profileHandleParamSchema,
  sanitizeTikTokHandle,
  type RankingRequestInput,
  type SeedAccountManagementInput,
  type LeaderboardQueryInput,
} from '../middlewares/social.schema';
import { IApiErrorResponse } from '../types';

export const socialController = {
  /**
   * GET /api/social/rank/:handle
   * Get ranking for a TikTok profile
   */
  getProfileRanking: async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate path parameter
      const paramParse = profileHandleParamSchema.safeParse(req.params);
      if (!paramParse.success) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 400,
          message: 'Invalid profile handle',
          details: paramParse.error.format(),
        };
        res.status(400).json(error);
        return;
      }

      // Validate query parameters
      const queryParse = rankingRequestSchema.partial().safeParse(req.query);
      if (!queryParse.success) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 400,
          message: 'Invalid query parameters',
          details: queryParse.error.format(),
        };
        res.status(400).json(error);
        return;
      }

      const handle = sanitizeTikTokHandle(paramParse.data.handle);
      const options = {
        force_refresh: queryParse.data.force_refresh || false,
        max_pages: 5, // Default limit for ranking calculations
      };

      console.log(`Getting ranking for profile: ${handle}`);

      const ranking = await socialRankingService.getProfileRanking(
        handle,
        options,
      );
      res.json(ranking);
    } catch (error) {
      console.error('Error getting profile ranking:', error);
      let errorResponse: IApiErrorResponse;

      if (error instanceof Error) {
        errorResponse = {
          status: 'error',
          code: 500,
          message: error.message,
        };
      } else {
        errorResponse = {
          status: 'error',
          code: 500,
          message: 'Unknown error occurred',
        };
      }

      res.status(500).json(errorResponse);
    }
  },

  /**
   * POST /api/social/rank
   * Calculate ranking for a TikTok profile (with simplified analysis)
   */
  calculateProfileRanking: async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const parse = rankingRequestSchema.safeParse(req.body);
      if (!parse.success) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 400,
          message: 'Validation error',
          details: parse.error.format(),
        };
        res.status(400).json(error);
        return;
      }

      const { handle, force_refresh } = parse.data;
      const sanitizedHandle = sanitizeTikTokHandle(handle);

      console.log(`Calculating ranking for profile: ${sanitizedHandle}`);

      // Use simplified ranking system
      const ranking = await socialRankingService.getProfileRanking(
        sanitizedHandle,
        {
          force_refresh: force_refresh || false, // Don't force refresh by default
          max_pages: 5,
        },
      );

      res.json(ranking);
    } catch (error) {
      console.error('Error calculating profile ranking:', error);
      let errorResponse: IApiErrorResponse;

      if (error instanceof Error) {
        errorResponse = {
          status: 'error',
          code: 500,
          message: error.message,
        };
      } else {
        errorResponse = {
          status: 'error',
          code: 500,
          message: 'Unknown error occurred',
        };
      }

      res.status(500).json(errorResponse);
    }
  },

  /**
   * POST /api/social/seed-accounts/manage
   * Add or remove a profile from seed accounts list
   */
  manageSeedAccount: async (req: Request, res: Response): Promise<void> => {
    try {
      const parse = seedAccountManagementSchema.safeParse(req.body);
      if (!parse.success) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 400,
          message: 'Validation error',
          details: parse.error.format(),
        };
        res.status(400).json(error);
        return;
      }

      const { profile_handle, action } = parse.data;
      const sanitizedHandle = sanitizeTikTokHandle(profile_handle);

      console.log(
        `${action === 'add' ? 'Adding' : 'Removing'} seed account: ${sanitizedHandle}`,
      );

      const profile = await socialRankingService.manageSeedAccount(
        sanitizedHandle,
        action,
      );

      const message = `Successfully ${action === 'add' ? 'added' : 'removed'} ${sanitizedHandle} ${action === 'add' ? 'to' : 'from'} seed accounts list`;

      const response = {
        success: true,
        profile,
        message,
      };

      res.json(response);
    } catch (error) {
      console.error('Error managing seed account:', error);
      let errorResponse: IApiErrorResponse;

      if (error instanceof Error) {
        errorResponse = {
          status: 'error',
          code: error.message.includes('not found') ? 404 : 500,
          message: error.message,
        };
      } else {
        errorResponse = {
          status: 'error',
          code: 500,
          message: 'Unknown error occurred',
        };
      }

      res.status(errorResponse.code).json(errorResponse);
    }
  },

  /**
   * GET /api/social/leaderboard
   * Get ranked leaderboard of TikTok profiles
   */
  getLeaderboard: async (req: Request, res: Response): Promise<void> => {
    try {
      const parse = leaderboardQuerySchema.safeParse(req.query);
      if (!parse.success) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 400,
          message: 'Invalid query parameters',
          details: parse.error.format(),
        };
        res.status(400).json(error);
        return;
      }

      const { page, limit, is_seed_account } = parse.data;

      console.log(
        `Getting leaderboard: page ${page}, limit ${limit}, seed_accounts_only: ${is_seed_account}`,
      );

      const leaderboard = await socialRankingService.getLeaderboard(
        page,
        limit,
        is_seed_account,
      );

      const response = {
        profiles: leaderboard.profiles,
        pagination: {
          total: leaderboard.total,
          page,
          limit,
          has_more: page * limit < leaderboard.total,
        },
      };

      res.json(response);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      let errorResponse: IApiErrorResponse;

      if (error instanceof Error) {
        errorResponse = {
          status: 'error',
          code: 500,
          message: error.message,
        };
      } else {
        errorResponse = {
          status: 'error',
          code: 500,
          message: 'Unknown error occurred',
        };
      }

      res.status(500).json(errorResponse);
    }
  },

  /**
   * GET /api/social/seed-accounts
   * Get list of all seed accounts
   */
  getSeedAccounts: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Getting seed accounts list');

      const seedAccounts = await socialRankingService.getLeaderboard(
        1,
        1000,
        true, // Only seed accounts
      );

      const response = {
        seed_accounts: seedAccounts.profiles,
        total_count: seedAccounts.total,
      };

      res.json(response);
    } catch (error) {
      console.error('Error getting seed accounts:', error);
      let errorResponse: IApiErrorResponse;

      if (error instanceof Error) {
        errorResponse = {
          status: 'error',
          code: 500,
          message: error.message,
        };
      } else {
        errorResponse = {
          status: 'error',
          code: 500,
          message: 'Unknown error occurred',
        };
      }

      res.status(500).json(errorResponse);
    }
  },

  /**
   * POST /api/social/trust-propagation/run
   * Run trust propagation iteration across all profiles
   * NOTE: This endpoint is deprecated in favor of the simplified ranking system
   */
  runTrustPropagation: async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(410).json({
        status: 'error',
        code: 410,
        message: 'Trust propagation endpoint is deprecated. Use the simplified ranking system instead.',
      });
    } catch (error) {
      console.error('Error in deprecated trust propagation endpoint:', error);
      res.status(500).json({
        status: 'error',
        code: 500,
        message: 'Endpoint deprecated',
      });
    }
  },

  /**
   * POST /api/social/trust-network/build
   * Build trust network from seed accounts
   */
  buildTrustNetwork: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Building trust network from seed accounts');

      const options = {
        max_pages: req.body.max_pages || 3,
      };

      const result = await socialRankingService.buildTrustNetwork(options);

      const response = {
        success: true,
        message: 'Trust network built successfully',
        ...result,
      };

      res.json(response);
    } catch (error) {
      console.error('Error building trust network:', error);
      let errorResponse: IApiErrorResponse;

      if (error instanceof Error) {
        errorResponse = {
          status: 'error',
          code: 500,
          message: error.message,
        };
      } else {
        errorResponse = {
          status: 'error',
          code: 500,
          message: 'Unknown error occurred',
        };
      }

      res.status(500).json(errorResponse);
    }
  },

  /**
   * GET /api/social/trust-network/stats
   * Get trust network statistics
   */
  getTrustNetworkStats: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Getting trust network statistics');

      const stats = await socialRankingService.getTrustNetworkStats();

      res.json({
        success: true,
        ...stats,
      });
    } catch (error) {
      console.error('Error getting trust network statistics:', error);
      let errorResponse: IApiErrorResponse;

      if (error instanceof Error) {
        errorResponse = {
          status: 'error',
          code: 500,
          message: error.message,
        };
      } else {
        errorResponse = {
          status: 'error',
          code: 500,
          message: 'Unknown error occurred',
        };
      }

      res.status(500).json(errorResponse);
    }
  },

  /**
   * GET /api/social/scraper/status
   * Check if the scraper service is configured and operational
   */
  getScraperStatus: async (req: Request, res: Response): Promise<void> => {
    try {
      const isConfigured = tikTokScraperService.isConfigured();

      const status = {
        configured: isConfigured,
        service: 'ScrapeCreators API',
        message: isConfigured
          ? 'Scraper service is configured and ready'
          : 'Scraper service is not configured - missing API key',
      };

      res.json(status);
    } catch (error) {
      console.error('Error checking scraper status:', error);
      let errorResponse: IApiErrorResponse;

      if (error instanceof Error) {
        errorResponse = {
          status: 'error',
          code: 500,
          message: error.message,
        };
      } else {
        errorResponse = {
          status: 'error',
          code: 500,
          message: 'Unknown error occurred',
        };
      }

      res.status(500).json(errorResponse);
    }
  },

  /**
   * DELETE /api/social/cache/:handle
   * Clear cache for a specific profile
   */
  clearProfileCache: async (req: Request, res: Response): Promise<void> => {
    try {
      const paramParse = profileHandleParamSchema.safeParse(req.params);
      if (!paramParse.success) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 400,
          message: 'Invalid profile handle',
          details: paramParse.error.format(),
        };
        res.status(400).json(error);
        return;
      }

      const handle = sanitizeTikTokHandle(paramParse.data.handle);

      console.log(`Clearing cache for profile: ${handle}`);

      tikTokScraperService.clearCache({ handle });

      const response = {
        success: true,
        message: `Cache cleared for profile: ${handle}`,
      };

      res.json(response);
    } catch (error) {
      console.error('Error clearing profile cache:', error);
      let errorResponse: IApiErrorResponse;

      if (error instanceof Error) {
        errorResponse = {
          status: 'error',
          code: 500,
          message: error.message,
        };
      } else {
        errorResponse = {
          status: 'error',
          code: 500,
          message: 'Unknown error occurred',
        };
      }

      res.status(500).json(errorResponse);
    }
  },

  /**
   * DELETE /api/social/cache
   * Clear all scraper cache
   */
  clearAllCache: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Clearing all scraper cache');

      tikTokScraperService.clearAllCache();

      const response = {
        success: true,
        message: 'All scraper cache cleared',
      };

      res.json(response);
    } catch (error) {
      console.error('Error clearing all cache:', error);
      let errorResponse: IApiErrorResponse;

      if (error instanceof Error) {
        errorResponse = {
          status: 'error',
          code: 500,
          message: error.message,
        };
      } else {
        errorResponse = {
          status: 'error',
          code: 500,
          message: 'Unknown error occurred',
        };
      }

      res.status(500).json(errorResponse);
    }
  },
};
