import { Request, Response } from 'express';
import { campaignService } from '../services/campaign';
import { IApiErrorResponse, ICampaignCreateRequest, ICampaignUpdateRequest, CampaignStatus } from '../types';

export const campaignController = {
  /**
   * POST /api/campaigns
   * Create a new campaign (club admin only)
   */
  createCampaign: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.user) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 401,
          message: 'Authentication required',
        };
        res.status(401).json(error);
        return;
      }

      const adminId = req.user.user.id;
      const campaignData: ICampaignCreateRequest = req.body;

      const campaignId = await campaignService.createCampaign(adminId, campaignData);

      res.status(201).json({
        success: true,
        data: {
          campaign_id: campaignId,
          message: 'Campaign created successfully',
        },
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      
      let errorResponse: IApiErrorResponse;
      if (error instanceof Error) {
        const code = error.message.includes('Only club admins') ? 403 : 400;
        errorResponse = {
          status: 'error',
          code,
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
   * GET /api/campaigns
   * List campaigns with optional filters
   */
  listCampaigns: async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, admin_id, page = 1, limit = 10 } = req.query;
      
      const campaignStatus = status as CampaignStatus | undefined;
      const adminId = admin_id as string | undefined;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;

      const result = await campaignService.listCampaigns(
        campaignStatus,
        adminId,
        pageNum,
        limitNum
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error listing campaigns:', error);
      const errorResponse: IApiErrorResponse = {
        status: 'error',
        code: 500,
        message: 'Failed to list campaigns',
      };
      res.status(500).json(errorResponse);
    }
  },

  /**
   * GET /api/campaigns/:id
   * Get campaign details
   */
  getCampaign: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const campaign = await campaignService.getCampaignDetails(id);
      
      if (!campaign) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 404,
          message: 'Campaign not found',
        };
        res.status(404).json(error);
        return;
      }

      res.json({
        success: true,
        data: campaign,
      });
    } catch (error) {
      console.error('Error getting campaign:', error);
      const errorResponse: IApiErrorResponse = {
        status: 'error',
        code: 500,
        message: 'Failed to get campaign',
      };
      res.status(500).json(errorResponse);
    }
  },

  /**
   * PUT /api/campaigns/:id
   * Update campaign (admin only)
   */
  updateCampaign: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.user) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 401,
          message: 'Authentication required',
        };
        res.status(401).json(error);
        return;
      }

      const { id } = req.params;
      const adminId = req.user.user.id;
      const updates: ICampaignUpdateRequest = req.body;

      await campaignService.updateCampaign(id, adminId, updates);

      res.json({
        success: true,
        message: 'Campaign updated successfully',
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
      
      let errorResponse: IApiErrorResponse;
      if (error instanceof Error) {
        const code = error.message.includes('not found') ? 404 :
                    error.message.includes('Only') ? 403 : 400;
        errorResponse = {
          status: 'error',
          code,
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
   * DELETE /api/campaigns/:id
   * Delete campaign (admin only)
   */
  deleteCampaign: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.user) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 401,
          message: 'Authentication required',
        };
        res.status(401).json(error);
        return;
      }

      const { id } = req.params;
      const adminId = req.user.user.id;

      await campaignService.deleteCampaign(id, adminId);

      res.json({
        success: true,
        message: 'Campaign deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      
      let errorResponse: IApiErrorResponse;
      if (error instanceof Error) {
        const code = error.message.includes('not found') ? 404 :
                    error.message.includes('Only') ? 403 : 400;
        errorResponse = {
          status: 'error',
          code,
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
   * POST /api/campaigns/:id/join
   * Join a campaign
   */
  joinCampaign: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.user) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 401,
          message: 'Authentication required',
        };
        res.status(401).json(error);
        return;
      }

      const { id } = req.params;
      const userId = req.user.user.id;

      const success = await campaignService.joinCampaign(id, userId);

      res.json({
        success: true,
        data: {
          joined: success,
          message: 'Successfully joined campaign',
        },
      });
    } catch (error) {
      console.error('Error joining campaign:', error);
      
      let errorResponse: IApiErrorResponse;
      if (error instanceof Error) {
        const code = error.message.includes('not found') ? 404 :
                    error.message.includes('not active') ? 400 :
                    error.message.includes('full') ? 400 :
                    error.message.includes('already joined') ? 409 : 400;
        errorResponse = {
          status: 'error',
          code,
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
   * POST /api/campaigns/:id/activate
   * Activate a campaign (admin only)
   */
  activateCampaign: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.user) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 401,
          message: 'Authentication required',
        };
        res.status(401).json(error);
        return;
      }

      const { id } = req.params;
      const adminId = req.user.user.id;

      await campaignService.activateCampaign(id, adminId);

      res.json({
        success: true,
        message: 'Campaign activated successfully',
      });
    } catch (error) {
      console.error('Error activating campaign:', error);
      
      let errorResponse: IApiErrorResponse;
      if (error instanceof Error) {
        const code = error.message.includes('not found') ? 404 :
                    error.message.includes('Only') ? 403 : 400;
        errorResponse = {
          status: 'error',
          code,
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
   * POST /api/campaigns/:id/complete
   * Complete a campaign and distribute rewards (admin only)
   */
  completeCampaign: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.user) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 401,
          message: 'Authentication required',
        };
        res.status(401).json(error);
        return;
      }

      const { id } = req.params;
      const adminId = req.user.user.id;

      await campaignService.completeCampaign(id, adminId);

      res.json({
        success: true,
        message: 'Campaign completed and rewards distributed',
      });
    } catch (error) {
      console.error('Error completing campaign:', error);
      
      let errorResponse: IApiErrorResponse;
      if (error instanceof Error) {
        const code = error.message.includes('not found') ? 404 :
                    error.message.includes('Only') ? 403 : 400;
        errorResponse = {
          status: 'error',
          code,
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
   * GET /api/campaigns/:id/leaderboard
   * Get campaign leaderboard
   */
  getCampaignLeaderboard: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { limit = 10 } = req.query;
      
      const limitNum = parseInt(limit as string, 10) || 10;
      const leaderboard = campaignService.getCampaignLeaderboard(id, limitNum);

      res.json({
        success: true,
        data: {
          campaign_id: id,
          leaderboard,
        },
      });
    } catch (error) {
      console.error('Error getting campaign leaderboard:', error);
      const errorResponse: IApiErrorResponse = {
        status: 'error',
        code: 500,
        message: 'Failed to get campaign leaderboard',
      };
      res.status(500).json(errorResponse);
    }
  },

  /**
   * GET /api/campaigns/:id/participants
   * Get all campaign participants
   */
  getCampaignParticipants: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const campaign = await campaignService.getCampaignDetails(id);
      
      if (!campaign) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 404,
          message: 'Campaign not found',
        };
        res.status(404).json(error);
        return;
      }

      res.json({
        success: true,
        data: {
          campaign_id: id,
          participants_count: campaign.participants_count,
          participants: campaign.leaderboard || [],
        },
      });
    } catch (error) {
      console.error('Error getting campaign participants:', error);
      const errorResponse: IApiErrorResponse = {
        status: 'error',
        code: 500,
        message: 'Failed to get campaign participants',
      };
      res.status(500).json(errorResponse);
    }
  },

  /**
   * GET /api/campaigns/:id/stats
   * Get campaign statistics
   */
  getCampaignStats: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const stats = await campaignService.getCampaignStats(id);
      
      if (!stats) {
        const error: IApiErrorResponse = {
          status: 'error',
          code: 404,
          message: 'Campaign not found',
        };
        res.status(404).json(error);
        return;
      }

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error getting campaign stats:', error);
      const errorResponse: IApiErrorResponse = {
        status: 'error',
        code: 500,
        message: 'Failed to get campaign stats',
      };
      res.status(500).json(errorResponse);
    }
  },

  /**
   * GET /api/users/:userId/campaigns
   * Get user's campaigns (both created and participated)
   */
  getUserCampaigns: async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      
      // Get campaigns created by user (if club admin)
      const createdCampaigns = await campaignService.listCampaigns(undefined, userId);
      
      // Get campaigns where user is a participant
      // This would require a more complex query - for now, return created campaigns
      // In a full implementation, you'd query the campaign_participants table
      
      res.json({
        success: true,
        data: {
          user_id: userId,
          created_campaigns: createdCampaigns.campaigns,
          participated_campaigns: [], // TODO: Implement participant campaigns query
        },
      });
    } catch (error) {
      console.error('Error getting user campaigns:', error);
      const errorResponse: IApiErrorResponse = {
        status: 'error',
        code: 500,
        message: 'Failed to get user campaigns',
      };
      res.status(500).json(errorResponse);
    }
  },
}; 