import {
  CampaignParticipant,
  createCampaign,
  getCampaignById,
  listCampaigns,
  updateCampaign,
  deleteCampaign,
  createCampaignParticipant,
  getCampaignParticipant,
  updateCampaignParticipant,
  getCampaignParticipants,
  createCampaignYap,
  getCampaignYaps,
  createCampaignReward,
  getCampaignRewards,
  createCampaignActivityLog,
  getCampaignLeaderboard,
  getUserById,
  getTikTokProfileById,
  getYapById,
} from '../database/db';
import {
  ICampaignCreateRequest,
  ICampaignUpdateRequest,
  ICampaignResponse,
  ICampaignListResponse,
  ICampaignStatsResponse,
  ICampaignLeaderboardEntry,
  CampaignStatus,
  ITikTokProfileSummary,
} from '../types';
import { getWeb3Service } from './web3';

interface BlockchainDeploymentResult {
  contractAddress: string;
  transactionHash: string;
  gasUsed: string;
}

export class CampaignService {
  
  /**
   * Create a new campaign (club admin only)
   */
  async createCampaign(adminId: string, campaignData: ICampaignCreateRequest): Promise<string> {
    // Validate admin permissions
    const admin = getUserById(adminId);
    if (!admin || admin.role !== 'club_admin') {
      throw new Error('Only club admins can create campaigns');
    }

    // Validate allocation percentages
    const totalAllocation = campaignData.first_place_allocation + 
                           campaignData.second_place_allocation + 
                           campaignData.third_place_allocation;
    if (totalAllocation > 100) {
      throw new Error('Total allocation cannot exceed 100%');
    }

    // Validate dates
    const startDate = new Date(campaignData.start_date);
    const endDate = new Date(campaignData.end_date);
    if (startDate >= endDate) {
      throw new Error('End date must be after start date');
    }

    // Validate pool amount and participants
    if (campaignData.pool_amount <= 0) {
      throw new Error('Pool amount must be positive');
    }
    if (campaignData.max_participants <= 0) {
      throw new Error('Maximum participants must be positive');
    }

    // Create campaign
    const campaignId = createCampaign({
      club_admin_id: adminId,
      title: campaignData.title,
      description: campaignData.description,
      fan_token_address: campaignData.fan_token_address,
      pool_amount: campaignData.pool_amount,
      max_participants: campaignData.max_participants,
      first_place_allocation: campaignData.first_place_allocation,
      second_place_allocation: campaignData.second_place_allocation,
      third_place_allocation: campaignData.third_place_allocation,
      start_date: campaignData.start_date,
      end_date: campaignData.end_date,
      status: 'pending',
      current_participants: 0,
      total_yaps: 0,
    });

    // Log activity
    createCampaignActivityLog({
      campaign_id: campaignId,
      user_id: adminId,
      activity_type: 'created',
      activity_data: JSON.stringify({ title: campaignData.title }),
      points_change: 0,
    });

    return campaignId;
  }

  /**
   * Join a campaign
   */
  async joinCampaign(campaignId: string, userId: string): Promise<boolean> {
    // Get campaign
    const campaign = getCampaignById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Check campaign status
    if (campaign.status !== 'active') {
      throw new Error('Campaign is not active');
    }

    // Check if campaign is within date range
    const now = new Date();
    const startDate = new Date(campaign.start_date);
    const endDate = new Date(campaign.end_date);
    
    if (now < startDate || now > endDate) {
      throw new Error('Campaign is not currently running');
    }

    // Check participant limit
    if (campaign.current_participants >= campaign.max_participants) {
      throw new Error('Campaign is full');
    }

    // Check if user already joined
    const existingParticipant = getCampaignParticipant(campaignId, userId);
    if (existingParticipant) {
      throw new Error('User already joined this campaign');
    }

    // Get user and validate TikTok account
    const user = getUserById(userId);
    if (!user || !user.tiktok_account) {
      throw new Error('User must have a connected TikTok account');
    }

    // Create participant
    const participantId = createCampaignParticipant({
      campaign_id: campaignId,
      user_id: userId,
      tiktok_profile_id: user.tiktok_account,
      total_points: 0,
      yap_count: 0,
    });

    // Update campaign participant count
    updateCampaign(campaignId, {
      current_participants: campaign.current_participants + 1,
    });

    // Log activity
    createCampaignActivityLog({
      campaign_id: campaignId,
      user_id: userId,
      activity_type: 'joined',
      activity_data: JSON.stringify({ participant_id: participantId }),
      points_change: 0,
    });

    return true;
  }

  /**
   * Process yap for active campaigns
   */
  async processYapForCampaigns(yapId: string, profileId: string): Promise<void> {
    // Get yap details
    const yap = getYapById(yapId);
    if (!yap) {
      console.error(`[CAMPAIGN SERVICE] Yap not found: ${yapId}`);
      return;
    }

    // Find active campaigns where this profile is a participant
    const activeParticipations = this.getActiveParticipations(profileId, yap.created_at);

    // Process yap for each active campaign
    for (const participation of activeParticipations) {
      const campaignPoints = this.calculateCampaignPoints(yap.yap_score);
      
      // Record yap in campaign
      createCampaignYap({
        campaign_id: participation.campaign_id,
        yap_id: yapId,
        participant_id: participation.id,
        points_earned: campaignPoints,
        bonus_multiplier: 1.0,
      });

      // Update participant totals
      updateCampaignParticipant(participation.id, {
        total_points: participation.total_points + campaignPoints,
        yap_count: participation.yap_count + 1,
      });

      // Update campaign totals
      const campaign = getCampaignById(participation.campaign_id);
      if (campaign) {
        updateCampaign(participation.campaign_id, {
          total_yaps: campaign.total_yaps + 1,
        });
      }

      // Update leaderboard rankings
      this.updateCampaignLeaderboard(participation.campaign_id);

      // Log activity
      createCampaignActivityLog({
        campaign_id: participation.campaign_id,
        user_id: participation.user_id,
        activity_type: 'yap_submitted',
        activity_data: JSON.stringify({ yap_id: yapId, points_earned: campaignPoints }),
        points_change: campaignPoints,
      });
    }
  }

  /**
   * Get active participations for a profile
   */
  private getActiveParticipations(profileId: string, yapCreatedAt: string): CampaignParticipant[] {
    // This is a simplified query - in production, you'd want to optimize this
    const allCampaigns = listCampaigns('active');
    const participations: CampaignParticipant[] = [];

    for (const campaign of allCampaigns) {
      const participants = getCampaignParticipants(campaign.id);
      const participant = participants.find(p => p.tiktok_profile_id === profileId);
      
      if (participant) {
        // Check if yap was created during campaign period
        const yapDate = new Date(yapCreatedAt);
        const startDate = new Date(campaign.start_date);
        const endDate = new Date(campaign.end_date);
        
        if (yapDate >= startDate && yapDate <= endDate) {
          participations.push(participant);
        }
      }
    }

    return participations;
  }

  /**
   * Calculate campaign points from yap score
   */
  private calculateCampaignPoints(yapScore: number): number {
    // Base points from yap score
    const basePoints = yapScore;
    
    // Campaign multiplier (can be adjusted per campaign)
    const campaignMultiplier = 1.0;
    
    // Time bonus (could be implemented for early participation)
    const timeBonus = 1.0;
    
    return basePoints * campaignMultiplier * timeBonus;
  }

  /**
   * Update campaign leaderboard rankings
   */
  private updateCampaignLeaderboard(campaignId: string): void {
    const participants = getCampaignParticipants(campaignId);
    
    // Sort by points (descending) then by last activity (ascending for tie-breaking)
    participants.sort((a, b) => {
      if (b.total_points === a.total_points) {
        return new Date(a.last_activity_at).getTime() - new Date(b.last_activity_at).getTime();
      }
      return b.total_points - a.total_points;
    });

    // Update rankings
    for (let i = 0; i < participants.length; i++) {
      updateCampaignParticipant(participants[i].id, {
        leaderboard_rank: i + 1,
      });
    }
  }

  /**
   * Get campaign leaderboard
   */
  getCampaignLeaderboard(campaignId: string, limit: number = 10): ICampaignLeaderboardEntry[] {
    return getCampaignLeaderboard(campaignId, limit);
  }

  /**
   * Complete campaign and distribute rewards
   */
  async completeCampaign(campaignId: string, adminId: string): Promise<{ success: boolean; message: string; blockchainInfo?: BlockchainDeploymentResult }> {
    // Validate admin permissions
    const admin = getUserById(adminId);
    if (!admin || admin.role !== 'club_admin') {
      return { success: false, message: 'Only club admins can complete campaigns' };
    }

    // Get campaign
    const campaign = getCampaignById(campaignId);
    if (!campaign) {
      return { success: false, message: 'Campaign not found' };
    }

    // Check if admin owns this campaign
    if (campaign.club_admin_id !== adminId) {
      return { success: false, message: 'Only the campaign creator can complete it' };
    }

    // Update campaign status
    updateCampaign(campaignId, { status: 'completed' });

    // Get top 3 participants
    const leaderboard = getCampaignLeaderboard(campaignId, 3);
    
    // Create reward records
    for (const entry of leaderboard) {
      if (entry.rank <= 3) {
        const allocation = this.getRewardAllocation(entry.rank, {
          first: campaign.first_place_allocation,
          second: campaign.second_place_allocation,
          third: campaign.third_place_allocation,
        });
        
        const tokenAmount = (campaign.pool_amount * allocation) / 100;
        
        const participant = getCampaignParticipant(campaignId, entry.userId);
        if (participant) {

          // TODO: Distribute tokens to participant using the fan token smart contract
          // if ok then update the campaign reward record with the tx hash

          // const txHash = await this.distributeTokens(participant.id, tokenAmount);

          createCampaignReward({
            campaign_id: campaignId,
            participant_id: participant.id,
            rank_position: entry.rank,
            token_amount: tokenAmount,
            allocation_percentage: allocation,
            distributed: false,
          });

          // Log activity
          createCampaignActivityLog({
            campaign_id: campaignId,
            user_id: entry.userId,
            activity_type: 'reward_distributed',
            activity_data: JSON.stringify({ 
              rank: entry.rank, 
              token_amount: tokenAmount, 
              allocation_percentage: allocation 
            }),
            points_change: 0,
          });
        }
      }
    }

    // Log campaign completion using the imported function
    createCampaignActivityLog({
      campaign_id: campaignId,
      user_id: adminId,
      activity_type: 'reward_distributed',
      activity_data: JSON.stringify({
        total_participants: leaderboard.length,
        total_rewards: leaderboard.reduce((sum, r) => sum + r.totalPoints, 0),
        blockchain_deployed: false,
        contract_address: undefined
      }),
      points_change: 0,
    });

    return { success: true, message: 'Campaign completed off-chain' };
  }

  /**
   * Get reward allocation percentage for a rank
   */
  private getRewardAllocation(rank: number, allocations: { first: number; second: number; third: number }): number {
    switch (rank) {
      case 1: return allocations.first;
      case 2: return allocations.second;
      case 3: return allocations.third;
      default: return 0;
    }
  }

  /**
   * Get campaign by ID with additional details
   */
  async getCampaignDetails(campaignId: string): Promise<ICampaignResponse | null> {
    const campaign = getCampaignById(campaignId);
    if (!campaign) {
      return null;
    }

    // Get admin profile
    const admin = getUserById(campaign.club_admin_id);
    let adminProfile: ITikTokProfileSummary | undefined;
    
    if (admin?.tiktok_account) {
      const profile = getTikTokProfileById(admin.tiktok_account);
      if (profile) {
        adminProfile = {
          id: profile.id,
          unique_id: profile.unique_id,
          nickname: profile.nickname,
          avatar_url: profile.avatar_url,
          follower_count: profile.follower_count,
          rank_score: profile.rank_score,
        };
      }
    }

    // Get leaderboard
    const leaderboard = getCampaignLeaderboard(campaignId, 10);

    return {
      campaign,
      admin_profile: adminProfile,
      participants_count: campaign.current_participants,
      leaderboard,
    };
  }

  /**
   * List campaigns with filters
   */
  async listCampaigns(
    status?: CampaignStatus,
    adminId?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ICampaignListResponse> {
    const campaigns = listCampaigns(status, adminId);
    
    // Simple pagination
    const offset = (page - 1) * limit;
    const paginatedCampaigns = campaigns.slice(offset, offset + limit);
    
    // Get detailed responses
    const campaignResponses = await Promise.all(
      paginatedCampaigns.map(async (campaign) => {
        const details = await this.getCampaignDetails(campaign.id);
        return details!;
      })
    );

    return {
      campaigns: campaignResponses,
      pagination: {
        total: campaigns.length,
        page,
        limit,
        has_more: offset + limit < campaigns.length,
      },
    };
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(campaignId: string): Promise<ICampaignStatsResponse | null> {
    const campaign = getCampaignById(campaignId);
    if (!campaign) {
      return null;
    }

    const participants = getCampaignParticipants(campaignId);
    const yaps = getCampaignYaps(campaignId);
    const rewards = getCampaignRewards(campaignId);

    const totalPoints = participants.reduce((sum, p) => sum + p.total_points, 0);
    const topPerformer = participants.reduce((top, p) => 
      p.total_points > top.total_points ? p : top
    );

    let topPerformerProfile: string = '';
    if (topPerformer) {
      const profile = getTikTokProfileById(topPerformer.tiktok_profile_id);
      topPerformerProfile = profile?.unique_id || '';
    }

    return {
      campaign,
      stats: {
        total_participants: participants.length,
        total_yaps: yaps.length,
        total_points_awarded: totalPoints,
        average_points_per_yap: yaps.length > 0 ? totalPoints / yaps.length : 0,
        top_performer: {
          user_id: topPerformer?.user_id || '',
          tiktok_profile: topPerformerProfile,
          total_points: topPerformer?.total_points || 0,
        },
        rewards_distributed: rewards.filter(r => r.distributed).length,
        total_rewards_value: rewards.reduce((sum, r) => sum + r.token_amount, 0),
      },
    };
  }

  /**
   * Update campaign
   */
  async updateCampaign(campaignId: string, adminId: string, updates: ICampaignUpdateRequest): Promise<void> {
    // Validate admin permissions
    const admin = getUserById(adminId);
    if (!admin || admin.role !== 'club_admin') {
      throw new Error('Only club admins can update campaigns');
    }

    // Get campaign
    const campaign = getCampaignById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Check if admin owns this campaign
    if (campaign.club_admin_id !== adminId) {
      throw new Error('Only the campaign creator can update it');
    }

    // Validate allocation percentages if provided
    if (updates.first_place_allocation !== undefined || 
        updates.second_place_allocation !== undefined || 
        updates.third_place_allocation !== undefined) {
      
      const first = updates.first_place_allocation ?? campaign.first_place_allocation;
      const second = updates.second_place_allocation ?? campaign.second_place_allocation;
      const third = updates.third_place_allocation ?? campaign.third_place_allocation;
      
      if (first + second + third > 100) {
        throw new Error('Total allocation cannot exceed 100%');
      }
    }

    // Update campaign
    updateCampaign(campaignId, updates);
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(campaignId: string, adminId: string): Promise<void> {
    // Validate admin permissions
    const admin = getUserById(adminId);
    if (!admin || admin.role !== 'club_admin') {
      throw new Error('Only club admins can delete campaigns');
    }

    // Get campaign
    const campaign = getCampaignById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Check if admin owns this campaign
    if (campaign.club_admin_id !== adminId) {
      throw new Error('Only the campaign creator can delete it');
    }

    // Cannot delete active campaigns with participants
    if (campaign.status === 'active' && campaign.current_participants > 0) {
      throw new Error('Cannot delete active campaigns with participants');
    }

    // Delete campaign (cascade will handle related records)
    deleteCampaign(campaignId);
  }

  /**
   * Activate campaign
   */
  async activateCampaign(campaignId: string, adminId: string): Promise<void> {
    // Validate admin permissions
    const admin = getUserById(adminId);
    if (!admin || admin.role !== 'club_admin') {
      throw new Error('Only club admins can activate campaigns');
    }

    // Get campaign
    const campaign = getCampaignById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Check if admin owns this campaign
    if (campaign.club_admin_id !== adminId) {
      throw new Error('Only the campaign creator can activate it');
    }

    // Can only activate pending campaigns
    if (campaign.status !== 'pending') {
      throw new Error('Only pending campaigns can be activated');
    }

    // Update campaign status
    updateCampaign(campaignId, { status: 'active' });
  }
}

export const campaignService = new CampaignService(); 

/**
 * Complete a campaign and deploy it to blockchain
 * @param campaignId - The ID of the campaign to complete
 * @param adminEvmAddress - The admin's EVM address
 * @returns Promise<{ success: boolean; message: string; blockchainInfo?: BlockchainDeploymentResult }>
 */
export async function completeCampaignWithBlockchain(
  campaignId: string,
  adminEvmAddress: string
): Promise<{ success: boolean; message: string; blockchainInfo?: BlockchainDeploymentResult }> {
  try {
    // Get campaign details using existing service
    const campaignDetails = await campaignService.getCampaignDetails(campaignId);
    if (!campaignDetails) {
      return { success: false, message: 'Campaign not found' };
    }
    
    const campaign = campaignDetails.campaign;
    
         // For now, we'll validate using the campaign's admin ID
     // In production, you'd want a proper getUserByEvmAddress function
     const admin = getUserById(campaign.club_admin_id);
    
    if (!admin || admin.role !== 'club_admin') {
      return { success: false, message: 'Only club admins can complete campaigns' };
    }
    
    if (campaign.club_admin_id !== admin.id) {
      return { success: false, message: 'Only the campaign creator can complete it' };
    }
    
    if (campaign.status !== 'completed') {
      return { success: false, message: 'Campaign must be completed off-chain first' };
    }
    
    // Get final leaderboard using existing service
    const leaderboard = await campaignService.getCampaignLeaderboard(campaignId);
    
    if (leaderboard.length === 0) {
      return { success: false, message: 'Cannot complete campaign with no participants' };
    }
    
    // Deploy to blockchain
    let blockchainInfo: BlockchainDeploymentResult | undefined;
    
    try {
      const web3Service = await getWeb3Service();
      
      // Deploy campaign contract
      const deployResult = await web3Service.deployCampaign(
        campaignId,
        campaign.title,
        adminEvmAddress,
        campaign.fan_token_address,
        campaign.pool_amount
      );
      
      // Prepare leaderboard for blockchain (use first 3 places for rewards)
      const topThree = leaderboard.slice(0, 3);
      const blockchainLeaderboard = topThree.map((entry, index) => {
        let allocation = 0;
        switch (index) {
          case 0: allocation = campaign.first_place_allocation; break;
          case 1: allocation = campaign.second_place_allocation; break;
          case 2: allocation = campaign.third_place_allocation; break;
        }
        
        return {
          userAddress: adminEvmAddress, // For now, use admin address as placeholder
          points: entry.totalPoints,
          allocation: (campaign.pool_amount * allocation) / 100
        };
      });
      
      // Finalize campaign on blockchain
      const finalizeResult = await web3Service.finalizeCampaign(
        campaignId,
        blockchainLeaderboard
      );
      
      blockchainInfo = {
        contractAddress: deployResult.contractAddress,
        transactionHash: finalizeResult.transactionHash,
        gasUsed: finalizeResult.gasUsed
      };
      
      console.log('✅ Campaign deployed to blockchain:', blockchainInfo);
      
    } catch (blockchainError) {
      console.error('❌ Blockchain deployment failed:', blockchainError);
      // Continue with off-chain completion even if blockchain fails
    }
    
    // Complete campaign off-chain using existing service
    const completionResult = await campaignService.completeCampaign(campaignId, adminEvmAddress);
    
    if (!completionResult.success) {
      return completionResult;
    }
    
    // Update the result message to include blockchain info
    return {
      success: true,
      message: blockchainInfo 
        ? `Campaign completed and deployed to blockchain at ${blockchainInfo.contractAddress}`
        : 'Campaign completed off-chain (blockchain deployment failed)',
      blockchainInfo
    };
    
  } catch (error) {
    console.error('Error completing campaign with blockchain:', error);
    return {
      success: false,
      message: 'Failed to complete campaign: ' + (error as Error).message
    };
  }
}

// Note: Helper functions for blockchain integration would be added here if needed
// For now, using the existing database functions from the imports consistently 