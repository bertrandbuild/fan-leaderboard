export interface TikTokProfile {
    id: string;
    unique_id: string;
    user_id?: string;
    nickname?: string;
    avatar_url?: string;
    follower_count: number;
    following_count: number;
    aweme_count: number;
    region?: string;
    verification_type: number;
    is_seed_account: boolean;
    rank_score: number;
  }
  
  export interface LeaderboardResponse {
    profiles: TikTokProfile[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      has_more: boolean;
    };
  }
  
  export interface RankingResponse {
    profile: TikTokProfile;
    ranking: {
      rank_score: number;
      rank_type: string;
      total_followers: number;
      known_followers: number;
      trust_depth: number;
      rank_percentile?: number;
    };
    last_updated: string;
  }