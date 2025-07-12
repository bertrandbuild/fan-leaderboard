/**
 * API client for Yap endpoints
 * Handles communication with backend yap scoring system
 */

import { SERVER_URL } from '@/config/config';

// Types matching backend responses
export interface Yap {
  id: string;
  video_url: string;
  aweme_id: string;
  profile_id: string;
  yap_score: number;
  total_comments: number;
  known_commenters_count: number;
  top_commenter_rank: number;
  weighted_engagement_score: number;
  created_at: string;
  scraped_at: string;
}

export interface YapScore {
  videoUrl: string;
  awemeId: string;
  score: number;
  knownInteractors: KnownCommenter[];
  totalComments: number;
  knownCommentersCount: number;
  weightedEngagementScore: number;
  qualifiesAsYap: boolean;
}

export interface KnownCommenter {
  profileId: string;
  username: string;
  nickname: string;
  rankScore: number;
  commentCount: number;
  totalLikes: number;
}

export interface YapStats {
  totalYaps: number;
  totalInteractions: number;
  averageYapScore: number;
  topYapScore: number;
}

export interface ProfileRanking {
  profile_id: string;
  unique_id: string;
  nickname: string;
  yap_count: number;
  total_yap_score: number;
  average_yap_score: number;
  rank_score: number;
}

export interface YapInteraction {
  id: string;
  yap_id: string;
  interactor_profile_id: string;
  comment_id?: string;
  comment_text?: string;
  comment_likes: number;
  interaction_weight: number;
  detected_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Base API function with error handling
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${SERVER_URL}/api/yaps${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<T> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'API call failed');
    }

    return result.data;
  } catch (error) {
    console.error(`Yap API Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Calculate yap score for a TikTok video without storing
 */
export async function calculateYapScore(videoUrl: string): Promise<YapScore> {
  const encodedUrl = encodeURIComponent(videoUrl);
  return apiCall<YapScore>(`/calculate?videoUrl=${encodedUrl}`);
}

/**
 * Get top yaps leaderboard
 */
export async function getYapLeaderboard(limit: number = 50): Promise<Yap[]> {
  return apiCall<Yap[]>(`/leaderboard?limit=${limit}`);
}

/**
 * Get profile ranking by yap performance
 */
export async function getProfileRanking(limit: number = 100): Promise<ProfileRanking[]> {
  return apiCall<ProfileRanking[]>(`/profile-ranking?limit=${limit}`);
}

/**
 * Get global yap statistics
 */
export async function getYapStats(): Promise<YapStats> {
  return apiCall<YapStats>('/stats');
}

/**
 * Search yaps by creator username
 */
export async function searchYapsByUsername(username: string): Promise<Yap[]> {
  const encodedUsername = encodeURIComponent(username);
  return apiCall<Yap[]>(`/search?username=${encodedUsername}`);
}

/**
 * List all yaps with optional filters
 */
export async function listYaps(options: {
  profileId?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<Yap[]> {
  const params = new URLSearchParams();
  
  if (options.profileId) params.append('profileId', options.profileId);
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.offset) params.append('offset', options.offset.toString());
  
  const queryString = params.toString();
  const endpoint = queryString ? `/?${queryString}` : '/';
  
  return apiCall<Yap[]>(endpoint);
}

/**
 * Get yap by ID
 */
export async function getYapById(id: string): Promise<Yap> {
  return apiCall<Yap>(`/${id}`);
}

/**
 * Get yap by video URL
 */
export async function getYapByVideoUrl(videoUrl: string): Promise<Yap> {
  const encodedUrl = encodeURIComponent(videoUrl);
  return apiCall<Yap>(`/url/${encodedUrl}`);
}

/**
 * Get yap interactions (comments) for a specific yap
 */
export async function getYapInteractions(yapId: string): Promise<YapInteraction[]> {
  return apiCall<YapInteraction[]>(`/${yapId}/interactions`);
}

/**
 * Get yaps by profile ID
 */
export async function getYapsByProfile(profileId: string): Promise<Yap[]> {
  return apiCall<Yap[]>(`/profile/${profileId}`);
}

/**
 * Get interactions by profile ID
 */
export async function getInteractionsByProfile(profileId: string): Promise<YapInteraction[]> {
  return apiCall<YapInteraction[]>(`/interactions/profile/${profileId}`);
}

/**
 * Process a TikTok video and store as yap (when implemented)
 */
export async function processYap(videoUrl: string, profileId?: string): Promise<Yap> {
  return apiCall<Yap>('/process', {
    method: 'POST',
    body: JSON.stringify({ videoUrl, profileId }),
  });
}

/**
 * Auto-process video with creator detection (when implemented)
 */
export async function autoProcessYap(videoUrl: string): Promise<Yap> {
  return apiCall<Yap>('/auto-process', {
    method: 'POST',
    body: JSON.stringify({ videoUrl }),
  });
}

/**
 * Batch process multiple videos (when implemented)
 */
export async function batchProcessYaps(
  videoUrls: string[],
  options: {
    profileId?: string;
    maxConcurrent?: number;
  } = {}
): Promise<Yap[]> {
  return apiCall<Yap[]>('/batch', {
    method: 'POST',
    body: JSON.stringify({
      videoUrls,
      ...options,
    }),
  });
}

/**
 * Recalculate yap score (when implemented)
 */
export async function recalculateYap(id: string): Promise<Yap> {
  return apiCall<Yap>(`/${id}/recalculate`, {
    method: 'PUT',
  });
}

/**
 * Delete yap (when implemented)
 */
export async function deleteYap(id: string): Promise<void> {
  return apiCall<void>(`/${id}`, {
    method: 'DELETE',
  });
}

// Cache management functions

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
}> {
  return apiCall<{
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  }>('/cache/stats');
}

/**
 * Clear entire cache
 */
export async function clearCache(): Promise<void> {
  return apiCall<void>('/cache', {
    method: 'DELETE',
  });
}

/**
 * Clear cache for specific video
 */
export async function clearVideoCache(videoUrl: string): Promise<void> {
  return apiCall<void>('/cache/video', {
    method: 'DELETE',
    body: JSON.stringify({ videoUrl }),
  });
}

/**
 * Toggle cache enabled/disabled
 */
export async function toggleCache(enabled: boolean): Promise<void> {
  return apiCall<void>('/cache/toggle', {
    method: 'PUT',
    body: JSON.stringify({ enabled }),
  });
}