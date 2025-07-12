import { getWeb3Service } from './web3';
import { campaignService } from './campaign';
import { getCampaignById } from '../database/db';
import { IUser } from '../types';
import Database from 'better-sqlite3';

interface BlockchainDeploymentResult {
  contractAddress: string;
  transactionHash: string;
  gasUsed: string;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  tiktokProfile: string;
  nickname?: string;
  totalPoints: number;
  yapCount: number;
}

interface CampaignData {
  id: string;
  club_admin_id: string;
  title: string;
  fan_token_address: string;
  pool_amount: number;
  first_place_allocation: number;
  second_place_allocation: number;
  third_place_allocation: number;
  status: string;
}

// Database connection helper
const getDatabaseConnection = (): Database.Database => {
  const Database = require('better-sqlite3');
  const path = require('path');
  
  const dbDir = process.env.RAILWAY_ENVIRONMENT_NAME
    ? '/app/data'
    : path.join(process.cwd(), './data');
  
  const dbPath = path.join(dbDir, 'local_db.db');
  return new Database(dbPath);
};

/**
 * Blockchain Campaign Service
 * Handles blockchain deployment and integration for campaigns
 */
export class BlockchainCampaignService {
  
  /**
   * Complete a campaign and deploy it to blockchain
   * @param campaignId - The ID of the campaign to complete
   * @param adminEvmAddress - The admin's EVM address
   * @returns Promise<{ success: boolean; message: string; blockchainInfo?: BlockchainDeploymentResult }>
   */
  async completeCampaignWithBlockchain(
    campaignId: string,
    adminEvmAddress: string
  ): Promise<{ success: boolean; message: string; blockchainInfo?: BlockchainDeploymentResult }> {
    const db = getDatabaseConnection();
    
    try {
      // Get campaign details
      const campaign = await this.getCampaignById(campaignId);
      if (!campaign) {
        return { success: false, message: 'Campaign not found' };
      }
      
      // Get the admin user
      const admin = db.prepare('SELECT * FROM users WHERE evm_address = ?').get(adminEvmAddress) as IUser | undefined;
      
      if (!admin || admin.role !== 'club_admin') {
        return { success: false, message: 'Only club admins can complete campaigns' };
      }
      
      if (campaign.club_admin_id !== admin.id) {
        return { success: false, message: 'Only the campaign creator can complete it' };
      }
      
      if (campaign.status !== 'active') {
        return { success: false, message: 'Only active campaigns can be completed' };
      }
      
      // Get final leaderboard
      const leaderboard = await this.getCampaignLeaderboard(campaignId);
      
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
        const blockchainLeaderboard = topThree.map((entry: LeaderboardEntry, index: number) => {
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
      
      // Complete campaign off-chain
      db.prepare('UPDATE campaigns SET status = ?, updated_at = ? WHERE id = ?')
        .run('completed', new Date().toISOString(), campaignId);
      
      // Store blockchain info if deployment succeeded
      if (blockchainInfo) {
        db.prepare('UPDATE campaigns SET blockchain_contract_address = ?, blockchain_tx_hash = ? WHERE id = ?')
          .run(blockchainInfo.contractAddress, blockchainInfo.transactionHash, campaignId);
      }
      
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
    } finally {
      db.close();
    }
  }
  
  /**
   * Get campaign by ID
   */
  private async getCampaignById(campaignId: string): Promise<CampaignData | null> {
    const db = getDatabaseConnection();
    
    try {
      const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId) as CampaignData | undefined;
      return campaign || null;
    } finally {
      db.close();
    }
  }
  
  /**
   * Get campaign leaderboard
   */
  private async getCampaignLeaderboard(campaignId: string): Promise<LeaderboardEntry[]> {
    const db = getDatabaseConnection();
    
    try {
      const participants = db.prepare(`
        SELECT 
          cp.user_id,
          cp.total_points,
          cp.yap_count,
          tp.unique_id as tiktok_profile,
          tp.nickname
        FROM campaign_participants cp
        JOIN tiktok_profiles tp ON cp.tiktok_profile_id = tp.id
        WHERE cp.campaign_id = ?
        ORDER BY cp.total_points DESC, cp.yap_count DESC
      `).all(campaignId) as any[];
      
      return participants.map((participant: any, index: number): LeaderboardEntry => ({
        rank: index + 1,
        userId: participant.user_id,
        tiktokProfile: participant.tiktok_profile,
        nickname: participant.nickname,
        totalPoints: participant.total_points,
        yapCount: participant.yap_count
      }));
      
    } finally {
      db.close();
    }
  }
  
  /**
   * Get user's claimable rewards from blockchain
   */
  async getClaimableRewards(campaignId: string, userEvmAddress: string): Promise<number> {
    try {
      const web3Service = await getWeb3Service();
      return await web3Service.getClaimableAmount(campaignId, userEvmAddress);
    } catch (error) {
      console.error('Error getting claimable rewards:', error);
      return 0;
    }
  }
  
  /**
   * Get campaign's blockchain contract address
   */
  async getCampaignContractAddress(campaignId: string): Promise<string | null> {
    const db = getDatabaseConnection();
    
    try {
      const campaign = db.prepare('SELECT blockchain_contract_address FROM campaigns WHERE id = ?').get(campaignId) as any;
      return campaign?.blockchain_contract_address || null;
    } finally {
      db.close();
    }
  }
}

// Export singleton instance
export const blockchainCampaignService = new BlockchainCampaignService(); 