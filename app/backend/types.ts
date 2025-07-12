export type IAgentName = `${string}_${string}_${string}`;

export type AgentStatus = 'enabled' | 'disabled' | 'pending' | 'error';

export type IAgentDetails = {
  name: string;
  description: string;
  systemPrompt: string;
  persona?: string;
  model: string;
};

export type IAgent = {
  id?: string;
  version: number;
  details: IAgentDetails;
  status: AgentStatus;
};

export interface IApiErrorResponse {
  /** The status of the error (e.g. 'error', 'success') */
  status: string;
  /** The code of the error (e.g. 400, 401, 403, 404, 500) */
  code: number;
  /** The message of the error */
  message: string;
  /** The details of the error */
  details?: any;
}


// --- TIKTOK SOCIAL TYPES ---

export interface ITikTokUser {
  unique_id: string;
  user_id?: string;
  sec_uid?: string;
  nickname?: string;
  avatar_168x168?: {
    url_list: string[];
  };
  avatar_larger?: {
    url_list: string[];
  };
  follower_count: number;
  following_count: number;
  aweme_count: number;
  region?: string;
  verification_type: number;
}

export interface IScrapeCreatorsApiResponse {
  extra: {
    fatal_item_ids: any[];
    logid: string;
    now: number;
  };
  followers?: ITikTokUser[];  // Optional for followers endpoint
  following?: ITikTokUser[];  // Optional for following endpoint (normalized)
  followings?: ITikTokUser[];  // Optional for following endpoint (actual API response)
  has_more: boolean;
  log_pb: {
    impr_id: string;
  };
  max_time: number;
  min_time: number;
  myself_user_id: string;
  next_page_token: string;
  offset: number;
  status_code: number;
  status_msg: string;
  total: number;
}

export interface ITikTokProfile {
  id: string;
  unique_id: string;
  user_id?: string;
  sec_uid?: string;
  nickname?: string;
  avatar_url?: string;
  follower_count: number;
  following_count: number;
  aweme_count: number;
  region?: string;
  verification_type: number;
  is_seed_account: boolean;
  // Legacy fields (kept for backward compatibility)
  known_followers_count: number;
  follower_rank_sum: number;
  weighted_follower_score: number;
  // Core trust fields
  trust_depth: number;
  rank_score: number;
  // New trust propagation fields
  trusted_by_count: number;
  trust_received_sum: number;
  following_trusted_count: number;
  last_scraped_at?: string;
  created_at: string;
  updated_at: string;
}

export interface IRankingRequest {
  handle: string;
  user_id?: string;
  force_refresh?: boolean;
}

export interface IRankingResponse {
  profile: ITikTokProfile;
  ranking: {
    rank_score: number;
    rank_type: 'trust_propagation' | 'smart_follower_based' | 'follower_based';
    total_followers: number;
    known_followers: number;
    trust_depth: number;
    rank_percentile?: number;
  };
  last_updated: string;
}

export interface ISmartFollowerManagementRequest {
  profile_handle: string;
  action: 'add' | 'remove';
}

export interface ISmartFollowerManagementResponse {
  success: boolean;
  profile: ITikTokProfile;
  message: string;
}

export interface ILeaderboardResponse {
  profiles: ITikTokProfile[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    has_more: boolean;
  };
}

// --- USER MANAGEMENT TYPES ---

export type UserRole = 'user' | 'club_admin';

export interface IUser {
  id: string;
  evm_address: string;
  role: UserRole;
  twitter_id?: string;
  youtube_id?: string;
  telegram_id?: string;
  tiktok_id?: string; // TikTok handle/username (e.g., 'jamal.voyage')
  tiktok_account?: string; // FK to tiktok_profiles table
  fan_tokens?: string[]; // Array of EVM addresses of fan tokens owned
  created_at: string;
  updated_at: string;
}

export interface IUserCreateRequest {
  evm_address: string;
  role?: UserRole;
  twitter_id?: string;
  youtube_id?: string;
  telegram_id?: string;
  tiktok_id?: string;
}

export interface IUserUpdateRequest {
  role?: UserRole;
  twitter_id?: string;
  youtube_id?: string;
  telegram_id?: string;
  tiktok_id?: string;
}

export interface IUserRoleUpdateRequest {
  role: UserRole;
}

export interface ITikTokProfileSummary {
  id: string;
  unique_id: string;
  nickname?: string;
  avatar_url?: string;
  follower_count: number;
  rank_score: number;
}

export interface IUserProfileResponse {
  user: IUser;
  tiktok_profile?: ITikTokProfileSummary;
}

export interface IFanTokenValidationRequest {
  evm_address: string;
}

export interface IFanTokenValidationResponse {
  fan_tokens: string[];
  is_valid: boolean;
}

export interface IAuthContext {
  user?: IUser;
  role: UserRole;
  is_authenticated: boolean;
}
