import {
  createUser,
  getUserById,
  getUserByEvmAddress,
  updateUser,
  deleteUser,
  listUsers,
  listClubAdmins,
  isClubAdmin,
  updateUserRole,
  updateUserFanTokens,
  getTikTokProfileById,
} from '../database/db';
import {
  IUser,
  IUserCreateRequest,
  IUserUpdateRequest,
  IUserRoleUpdateRequest,
  IUserProfileResponse,
  IFanTokenValidationResponse,
  ITikTokProfileSummary,
  UserRole,
} from '../types';
import { sanitizeEvmAddress, sanitizeTwitterId, sanitizeTikTokHandle } from '../middlewares/user.schema';
import { socialRankingService } from './social-ranking';

export class UserService {
  /**
   * Create a new user
   */
  async createUserProfile(userRequest: IUserCreateRequest): Promise<IUser> {
    const evmAddress = sanitizeEvmAddress(userRequest.evm_address);
    
    // Check if user already exists
    const existingUser = getUserByEvmAddress(evmAddress);
    if (existingUser) {
      return existingUser;
    }
    
    // Handle TikTok profile creation/fetching if handle is provided
    let tiktokAccountId: string | undefined = undefined;
    if (userRequest.tiktok_id) {
      const sanitizedHandle = sanitizeTikTokHandle(userRequest.tiktok_id);
      try {
        console.log(`Fetching/creating TikTok profile for handle: ${sanitizedHandle}`);
        const rankingResponse = await socialRankingService.getProfileRanking(sanitizedHandle);
        tiktokAccountId = rankingResponse.profile.id;
        console.log(`TikTok profile found/created with ID: ${tiktokAccountId}`);
      } catch (error) {
        console.error(`Failed to fetch/create TikTok profile for handle ${sanitizedHandle}:`, error);
        throw new Error(`Failed to fetch TikTok profile for handle: ${sanitizedHandle}`);
      }
    }
    
    // Sanitize social media IDs
    const sanitizedData = {
      evm_address: evmAddress,
      role: userRequest.role || 'user',
      twitter_id: userRequest.twitter_id ? sanitizeTwitterId(userRequest.twitter_id) : undefined,
      youtube_id: userRequest.youtube_id?.trim(),
      telegram_id: userRequest.telegram_id?.trim(),
      tiktok_id: userRequest.tiktok_id ? sanitizeTikTokHandle(userRequest.tiktok_id) : undefined,
      tiktok_account: tiktokAccountId,
    };
    
    const userId = createUser(sanitizedData);
    const user = getUserById(userId);
    
    if (!user) {
      throw new Error('Failed to create user');
    }
    
    return getUserById(userId)!;
  }
  
  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<IUser | null> {
    return getUserById(id);
  }
  
  /**
   * Get user by EVM address
   */
  async getUserByEvmAddress(evmAddress: string): Promise<IUser | null> {
    const sanitizedAddress = sanitizeEvmAddress(evmAddress);
    return getUserByEvmAddress(sanitizedAddress);
  }
  
  /**
   * Update user profile
   */
  async updateUserProfile(id: string, updates: IUserUpdateRequest): Promise<IUser> {
    const user = getUserById(id);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Handle TikTok profile creation/fetching if handle is provided
    let tiktokAccountId: string | undefined = undefined;
    if (updates.tiktok_id) {
      const sanitizedHandle = sanitizeTikTokHandle(updates.tiktok_id);
      try {
        console.log(`Fetching/creating TikTok profile for handle: ${sanitizedHandle}`);
        const rankingResponse = await socialRankingService.getProfileRanking(sanitizedHandle);
        tiktokAccountId = rankingResponse.profile.id;
        console.log(`TikTok profile found/created with ID: ${tiktokAccountId}`);
      } catch (error) {
        console.error(`Failed to fetch/create TikTok profile for handle ${sanitizedHandle}:`, error);
        throw new Error(`Failed to fetch TikTok profile for handle: ${sanitizedHandle}`);
      }
    }
    
    // Sanitize social media IDs
    const sanitizedUpdates = {
      twitter_id: updates.twitter_id ? sanitizeTwitterId(updates.twitter_id) : undefined,
      youtube_id: updates.youtube_id?.trim(),
      telegram_id: updates.telegram_id?.trim(),
      tiktok_id: updates.tiktok_id ? sanitizeTikTokHandle(updates.tiktok_id) : undefined,
      tiktok_account: tiktokAccountId,
    };
    
    updateUser(id, sanitizedUpdates);
    
    const updatedUser = getUserById(id);
    if (!updatedUser) {
      throw new Error('Failed to update user');
    }
    
    return updatedUser;
  }
  
  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    const user = getUserById(id);
    if (!user) {
      throw new Error('User not found');
    }
    
    deleteUser(id);
  }
  
  /**
   * Get user profile with TikTok profile data
   */
  async getUserTikTokProfile(id: string): Promise<IUserProfileResponse | null> {
    const user = getUserById(id);
    if (!user) {
      return null;
    }
    
    let tiktokProfile = undefined;
    if (user.tiktok_account) {
      const profile = getTikTokProfileById(user.tiktok_account);
      if (profile) {
        tiktokProfile = {
          id: profile.id,
          unique_id: profile.unique_id,
          nickname: profile.nickname,
          avatar_url: profile.avatar_url,
          follower_count: profile.follower_count,
          rank_score: profile.rank_score,
        };
      }
    }
    
    return {
      user,
      tiktok_profile: tiktokProfile,
    };
  }
  
  /**
   * List users with pagination
   */
  async listUsers(page: number = 1, limit: number = 50, role?: UserRole): Promise<{
    users: IUser[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      has_more: boolean;
    };
  }> {
    const allUsers = listUsers(role);
    
    const total = allUsers.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const users = allUsers.slice(startIndex, endIndex);
    
    return {
      users,
      pagination: {
        total,
        page,
        limit,
        has_more: endIndex < total,
      },
    };
  }
  
  /**
   * Generate mock fan tokens for demonstration
   * In production, this would be replaced with actual blockchain calls
   */
  private generateMockFanTokens(evmAddress: string): string[] {
    // Mock fan token addresses for demonstration
    const mockTokens = [
      '0x1234567890abcdef1234567890abcdef12345678', // Barcelona Fan Token
      '0x2345678901bcdef02345678901bcdef023456789', // Real Madrid Fan Token
      '0x3456789012cdef123456789012cdef0123456789', // Manchester City Fan Token
    ];
    
    // Simulate different users having different tokens
    const addressNum = parseInt(evmAddress.slice(-4), 16);
    const tokenCount = addressNum % 3 + 1; // 1-3 tokens
    
    return mockTokens.slice(0, tokenCount);
  }
  
  /**
   * Update user role
   */
  async updateUserRole(evmAddress: string, role: UserRole): Promise<IUser> {
    const sanitizedAddress = sanitizeEvmAddress(evmAddress);
    
    const user = getUserByEvmAddress(sanitizedAddress);
    if (!user) {
      throw new Error('User not found');
    }
    
    updateUserRole(sanitizedAddress, role);
    
    const updatedUser = getUserByEvmAddress(sanitizedAddress);
    if (!updatedUser) {
      throw new Error('Failed to update user role');
    }
    
    return updatedUser;
  }
  
  /**
   * List club admins
   */
  async listClubAdmins(): Promise<IUser[]> {
    return listClubAdmins();
  }
  
  /**
   * Check if address is club admin
   */
  async isClubAdmin(evmAddress: string): Promise<boolean> {
    const sanitizedAddress = sanitizeEvmAddress(evmAddress);
    return isClubAdmin(sanitizedAddress);
  }
}

export const userService = new UserService(); 