import {
  Comment,
  CommentsResponse,
  YapScore,
  KnownCommenter,
  createYap,
  createYapInteraction,
  getYapByVideoUrl,
  getTikTokProfileByHandle,
  getTikTokProfileById,
  logScraperCall,
  Yap,
  YapInteraction,
} from '../database/db';
import { ApiCache } from '../utils/api-cache';
import { socialRankingService } from './social-ranking';

// Rate limiting configuration
const RATE_LIMIT = {
  requestsPerMinute: 60,
  delayBetweenRequests: 1000, // 1 second
  maxRetries: 3,
  backoffMultiplier: 2,
};

// Environment validation
if (!process.env.SCRAPECREATORS_API_KEY) {
  console.warn('[YAP SERVICE] SCRAPECREATORS_API_KEY not found in environment');
}

// Cache instance for TikTok comments API calls
// TTL set to 1 hour since comments can change frequently but not too often
const commentsCache = ApiCache.getInstance('tiktok-comments', {
  ttl: 60 * 60 * 1000, // 1 hour
  enabled: true,
  persist: true,
});

// Yap qualification criteria
const YAP_CRITERIA = {
  minTotalComments: 10,
  minKnownCommenters: 0,
  minYapScore: 0.5,
  minCommenterRankScore: 5,
};

// Scoring weights
const SCORING_WEIGHTS = {
  baseScoreWeight: 0.4,
  weightedScoreWeight: 0.6,
  knownCommenterMultiplier: 3,
  totalCommentMultiplier: 0.1,
};

/**
 * Extracts TikTok video ID from URL
 */
function extractAwemeIdFromUrl(videoUrl: string): string | null {
  const patterns = [
    /\/video\/(\d+)/,
    /\/v\/(\d+)/,
    /tiktok\.com\/.*\/video\/(\d+)/,
  ];
  
  for (const pattern of patterns) {
    const match = videoUrl.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extracts creator username from TikTok video URL
 */
function extractCreatorFromUrl(videoUrl: string): string | null {
  const patterns = [
    /tiktok\.com\/@([^\/]+)/,
    /tiktok\.com\/(@[^\/]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = videoUrl.match(pattern);
    if (match) {
      // Remove @ symbol if present
      return match[1].replace('@', '');
    }
  }
  
  return null;
}

/**
 * Validates TikTok video URL format
 */
function isValidTikTokUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
    /^https?:\/\/(vm\.)?tiktok\.com\/[\w-]+/,
    /^https?:\/\/(www\.)?tiktok\.com\/t\/[\w-]+/,
  ];
  
  const isValid = patterns.some(pattern => pattern.test(url));
  return isValid;
}

/**
 * Implements exponential backoff for API requests
 */
async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetches all comments from a TikTok video using pagination
 */
export async function fetchTikTokComments(videoUrl: string): Promise<Comment[]> {
  if (!isValidTikTokUrl(videoUrl)) {
    throw new Error('Invalid TikTok video URL format');
  }

  const apiKey = process.env.SCRAPECREATORS_API_KEY;
  if (!apiKey) {
    throw new Error('SCRAPECREATORS_API_KEY environment variable not set');
  }

  // Generate cache key based on video URL
  const cacheKey = ApiCache.hashKey(videoUrl);
  
  // Check cache first
  const cachedComments = commentsCache.get(cacheKey);
  if (cachedComments) {
    console.log(`[YAP SERVICE] Cache hit for ${videoUrl} - returning ${cachedComments.length} cached comments`);
    return cachedComments;
  }

  console.log(`[YAP SERVICE] Cache miss for ${videoUrl} - fetching from API`);

  const allComments: Comment[] = [];
  let cursor: number | null = null;
  let hasMore = true;
  let requestCount = 0;
  const startTime = Date.now();

  try {
    while (hasMore) {
      const params = new URLSearchParams({
        url: videoUrl,
        trim: 'true',
        ...(cursor && { cursor: cursor.toString() }),
      });

      const requestStartTime = Date.now();
      
      const response = await fetch(
        `https://api.scrapecreators.com/v1/tiktok/video/comments?${params}`,
        {
          headers: {
            'x-api-key': apiKey,
          },
        }
      );

      const requestDuration = Date.now() - requestStartTime;
      requestCount++;

      if (!response.ok) {
        // Log failed API call
        await logScraperCall({
          profile_handle: videoUrl,
          api_endpoint: 'tiktok/video/comments',
          success: false,
          response_code: response.status,
          error_message: `HTTP ${response.status}: ${response.statusText}`,
          followers_fetched: 0,
          api_call_duration_ms: requestDuration,
        });

        if (response.status === 429) {
          // Rate limited - implement exponential backoff
          const retryAfter = response.headers.get('Retry-After');
          const delayMs = retryAfter ? parseInt(retryAfter) * 1000 : RATE_LIMIT.delayBetweenRequests * 2;
          console.log('[YAP SERVICE] Rate limited, retrying after', delayMs, 'ms');
          await delay(delayMs);
          continue;
        }

        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data: CommentsResponse = await response.json();

      // Check if we have a valid response with comments array
      if (!data.comments || !Array.isArray(data.comments)) {
        // Log failed TikTok API response
        await logScraperCall({
          profile_handle: videoUrl,
          api_endpoint: 'tiktok/video/comments',
          success: false,
          response_code: response.status,
          error_message: `Invalid API response: missing comments array`,
          followers_fetched: 0,
          api_call_duration_ms: requestDuration,
        });

        throw new Error(`Invalid API response: missing comments array`);
      }

      // Check if API returned an error (some APIs include error info in successful HTTP responses)
      if (data.status_code !== undefined && data.status_code !== 0) {
        // Log failed TikTok API response
        await logScraperCall({
          profile_handle: videoUrl,
          api_endpoint: 'tiktok/video/comments',
          success: false,
          response_code: data.status_code,
          error_message: `TikTok API error: ${data.status_msg}`,
          followers_fetched: 0,
          api_call_duration_ms: requestDuration,
        });

        throw new Error(`TikTok API error: ${data.status_msg}`);
      }

      // Log successful API call
      await logScraperCall({
        profile_handle: videoUrl,
        api_endpoint: 'tiktok/video/comments',
        success: true,
        response_code: 200,
        followers_fetched: data.comments.length,
        api_call_duration_ms: requestDuration,
      });

      allComments.push(...data.comments);
      cursor = data.cursor;
      hasMore = data.has_more === 1;

      // Rate limiting - wait between requests
      if (hasMore) {
        await delay(RATE_LIMIT.delayBetweenRequests);
      }
    }

    const totalDuration = Date.now() - startTime;
    console.log(`[YAP SERVICE] Fetched ${allComments.length} comments in ${requestCount} requests (${totalDuration}ms)`);
    
    // Cache the successful result
    commentsCache.set(cacheKey, allComments);
    console.log(`[YAP SERVICE] Cached ${allComments.length} comments for ${videoUrl}`);
    
    return allComments;
  } catch (error) {
    console.error('[YAP SERVICE] Error fetching TikTok comments:', error);
    console.error('[YAP SERVICE] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
}

/**
 * Cross-reference commenters against tiktok_profiles database
 */
export async function matchCommentersToProfiles(comments: Comment[]): Promise<KnownCommenter[]> {
  const uniqueCommenters = new Map<string, Comment>();
  
  // Deduplicate commenters by unique_id
  comments.forEach(comment => {
    if (!uniqueCommenters.has(comment.user.unique_id)) {
      uniqueCommenters.set(comment.user.unique_id, comment);
    }
  });

  const knownCommenters: KnownCommenter[] = [];

  for (const comment of uniqueCommenters.values()) {
    // Try to find profile by unique_id first, then by user_id
    let profile = getTikTokProfileByHandle(comment.user.unique_id);
    
    if (profile) {
      const userComments = comments.filter(c => c.user.unique_id === comment.user.unique_id);
      const totalLikes = userComments.reduce((sum, c) => sum + c.digg_count, 0);

      const knownCommenter = {
        profileId: profile.id,
        username: profile.unique_id,
        nickname: profile.nickname || comment.user.nickname,
        rankScore: profile.rank_score,
        commentCount: userComments.length,
        totalLikes,
      };
      knownCommenters.push(knownCommenter);
    }
  }

  return knownCommenters;
}

/**
 * Calculate yap score based on engagement from known accounts
 */
export async function calculateYapScore(videoUrl: string): Promise<YapScore> {
  try {
    // Fetch all comments
    const comments = await fetchTikTokComments(videoUrl);
    
    if (comments.length === 0) {
      throw new Error('No comments found for this video');
    }

    // Extract aweme_id from first comment or URL
    const awemeId = comments[0]?.aweme_id || extractAwemeIdFromUrl(videoUrl);
    if (!awemeId) {
      throw new Error('Could not extract TikTok video ID');
    }

    // Match commenters to known profiles
    const knownCommenters = await matchCommentersToProfiles(comments);

    // Calculate base engagement score
    const baseScore = (knownCommenters.length * SCORING_WEIGHTS.knownCommenterMultiplier) + 
                     (comments.length * SCORING_WEIGHTS.totalCommentMultiplier);

    // Calculate weighted engagement score
    let weightedScore = 0;
    for (const commenter of knownCommenters) {
      const commentMultiplier = commenter.commentCount;
      const likesMultiplier = Math.log10(1 + commenter.totalLikes);
      const interactionWeight = commenter.rankScore * commentMultiplier * likesMultiplier;
      weightedScore += interactionWeight;
    }

    // Calculate final yap score (0-100 scale)
    const finalScore = Math.min(
      100,
      (baseScore * SCORING_WEIGHTS.baseScoreWeight) + 
      (weightedScore * SCORING_WEIGHTS.weightedScoreWeight)
    );

    // Check if qualifies as yap
    const qualifiesAsYap = isYap(
      comments.length,
      knownCommenters.length,
      finalScore,
      knownCommenters
    );

    return {
      videoUrl,
      awemeId,
      score: finalScore,
      knownInteractors: knownCommenters,
      totalComments: comments.length,
      knownCommentersCount: knownCommenters.length,
      weightedEngagementScore: weightedScore,
      qualifiesAsYap,
    };
  } catch (error) {
    console.error('[YAP SERVICE] Error calculating yap score:', error);
    throw error;
  }
}

/**
 * Check if content qualifies as a yap
 */
export function isYap(
  totalComments: number,
  knownCommentersCount: number,
  yapScore: number,
  knownCommenters: KnownCommenter[]
): boolean {
  // Check minimum total comments
  if (totalComments < YAP_CRITERIA.minTotalComments) {
    return false;
  }

  // Check minimum known commenters
  if (knownCommentersCount < YAP_CRITERIA.minKnownCommenters) {
    return false;
  }

  // Check minimum yap score
  if (yapScore < YAP_CRITERIA.minYapScore) {
    return false;
  }

  // // Check that at least one known commenter has sufficient rank score
  // const hasQualifiedCommenter = knownCommenters.some(
  //   commenter => commenter.rankScore > YAP_CRITERIA.minCommenterRankScore
  // );

  return true;
}

/**
 * Process video and store as yap if it qualifies
 */
export async function processAndStoreYap(videoUrl: string, profileId?: string): Promise<{
  yapId: string | null;
  yapScore: YapScore;
  stored: boolean;
}> {
  try {
    // Check if yap already exists
    const existingYap = getYapByVideoUrl(videoUrl);
    if (existingYap) {
      throw new Error('Yap already exists for this video URL');
    }

    // Calculate yap score
    const yapScore = await calculateYapScore(videoUrl);

    if (!yapScore.qualifiesAsYap) {
      return {
        yapId: null,
        yapScore,
        stored: false,
      };
    }

    // If no profileId provided, extract creator from video URL and find/create profile
    let creatorProfileId = profileId;
    let profile = null;
    
    if (!creatorProfileId) {
      // Extract creator username from video URL
      const creatorUsername = extractCreatorFromUrl(videoUrl);
      if (!creatorUsername) {
        throw new Error('Could not extract creator username from video URL');
      }
      
      console.log(`[YAP SERVICE] No profileId provided, extracted creator: ${creatorUsername}`);
      
      // Try to find existing profile
      profile = getTikTokProfileByHandle(creatorUsername);
      
      if (!profile) {
        console.log(`[YAP SERVICE] Profile not found, creating new profile for: ${creatorUsername}`);
        try {
          // Use social ranking service to create/fetch the profile
          const rankingResult = await socialRankingService.getProfileRanking(creatorUsername);
          profile = rankingResult.profile;
          console.log(`[YAP SERVICE] Successfully created/fetched profile for: ${creatorUsername}`);
        } catch (error) {
          console.error(`[YAP SERVICE] Failed to create profile for ${creatorUsername}:`, error);
          throw new Error(`Failed to create profile for creator: ${creatorUsername}`);
        }
      }
      
      creatorProfileId = profile.id;
    } else {
      // Validate provided profile exists
      profile = getTikTokProfileById(creatorProfileId);
      if (!profile) {
        throw new Error('Profile not found in database');
      }
    }

    // Calculate top commenter rank
    const topCommenterRank = yapScore.knownInteractors.reduce(
      (max, commenter) => Math.max(max, commenter.rankScore),
      0
    );

    // Create yap record
    const yapId = createYap({
      video_url: videoUrl,
      aweme_id: yapScore.awemeId,
      profile_id: creatorProfileId,
      yap_score: yapScore.score,
      total_comments: yapScore.totalComments,
      known_commenters_count: yapScore.knownCommentersCount,
      top_commenter_rank: topCommenterRank,
      weighted_engagement_score: yapScore.weightedEngagementScore,
    });

    // Store individual interactions
    for (const commenter of yapScore.knownInteractors) {
      const interactionWeight = commenter.rankScore * commenter.commentCount * Math.log10(1 + commenter.totalLikes);
      
      createYapInteraction({
        yap_id: yapId,
        interactor_profile_id: commenter.profileId,
        comment_id: undefined, // We don't store individual comment IDs in this implementation
        comment_text: undefined,
        comment_likes: commenter.totalLikes,
        interaction_weight: interactionWeight,
      });
    }

    // Process yap for active campaigns
    try {
      const { campaignService } = require('./campaign');
      await campaignService.processYapForCampaigns(yapId, creatorProfileId);
      console.log(`[YAP SERVICE] Processed yap ${yapId} for campaigns`);
    } catch (error) {
      console.error(`[YAP SERVICE] Error processing yap ${yapId} for campaigns:`, error);
      // Don't throw error here - campaign processing is optional
    }

    return {
      yapId,
      yapScore,
      stored: true,
    };
  } catch (error) {
    console.error('Error processing and storing yap:', error);
    throw error;
  }
}

/**
 * Batch process multiple videos
 */
export async function batchProcessYaps(
  videoUrls: string[],
  profileId?: string,
  maxConcurrent: number = 3
): Promise<Array<{
  videoUrl: string;
  success: boolean;
  yapId: string | null;
  error?: string;
}>> {
  const results: Array<{
    videoUrl: string;
    success: boolean;
    yapId: string | null;
    error?: string;
  }> = [];

  // Process in batches to avoid rate limits
  for (let i = 0; i < videoUrls.length; i += maxConcurrent) {
    const batch = videoUrls.slice(i, i + maxConcurrent);
    
    const batchPromises = batch.map(async (videoUrl) => {
      try {
        const result = await processAndStoreYap(videoUrl, profileId);
        return {
          videoUrl,
          success: true,
          yapId: result.yapId,
        };
      } catch (error) {
        return {
          videoUrl,
          success: false,
          yapId: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          videoUrl: batch[index],
          success: false,
          yapId: null,
          error: result.reason?.message || 'Promise rejected',
        });
      }
    });

    // Delay between batches to respect rate limits
    if (i + maxConcurrent < videoUrls.length) {
      await delay(RATE_LIMIT.delayBetweenRequests * maxConcurrent);
    }
  }

  return results;
}

/**
 * Get yap leaderboard sorted by score
 */
export function getYapLeaderboard(limit: number = 50): Yap[] {
  const {
    listYaps,
  } = require('../database/db');
  
  return listYaps().slice(0, limit);
}

/**
 * Recalculate yap score for existing yap (useful for score algorithm updates)
 */
export async function recalculateYapScore(yapId: string): Promise<YapScore> {
  const {
    getYapById,
    updateYap,
  } = require('../database/db');
  
  const existingYap = getYapById(yapId);
  if (!existingYap) {
    throw new Error('Yap not found');
  }

  const newScore = await calculateYapScore(existingYap.video_url);
  
  // Update the yap with new scores
  updateYap(yapId, {
    yap_score: newScore.score,
    known_commenters_count: newScore.knownCommentersCount,
    weighted_engagement_score: newScore.weightedEngagementScore,
    top_commenter_rank: newScore.knownInteractors.reduce(
      (max, commenter) => Math.max(max, commenter.rankScore),
      0
    ),
  });

  return newScore;
}

/**
 * Auto-detect and process yap without requiring explicit profileId
 */
export async function autoProcessYap(videoUrl: string): Promise<{
  yapId: string | null;
  yapScore: YapScore;
  stored: boolean;
  creatorProfile?: { id: string; username: string; nickname?: string };
}> {
  try {
    const result = await processAndStoreYap(videoUrl);
    
    // Get creator profile info if yap was stored
    let creatorProfile = undefined;
    if (result.yapId) {
      const creatorUsername = extractCreatorFromUrl(videoUrl);
      if (creatorUsername) {
        const profile = getTikTokProfileByHandle(creatorUsername);
        if (profile) {
          creatorProfile = {
            id: profile.id,
            username: profile.unique_id,
            nickname: profile.nickname || undefined,
          };
        }
      }
    }
    
    return {
      ...result,
      creatorProfile,
    };
  } catch (error) {
    console.error('[YAP SERVICE] Error in auto-process yap:', error);
    throw error;
  }
}

/**
 * Cache management utilities
 */
export const cacheUtils = {
  /**
   * Clear all cached comments
   */
  clearCache(): void {
    commentsCache.clear();
    console.log('[YAP SERVICE] Comments cache cleared');
  },

  /**
   * Clear cache for a specific video URL
   */
  clearVideoCache(videoUrl: string): boolean {
    const cacheKey = ApiCache.hashKey(videoUrl);
    const deleted = commentsCache.delete(cacheKey);
    console.log(`[YAP SERVICE] Cache ${deleted ? 'cleared' : 'not found'} for ${videoUrl}`);
    return deleted;
  },

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hits: number; misses: number } {
    return commentsCache.getStats();
  },

  /**
   * Enable or disable caching
   */
  setEnabled(enabled: boolean): void {
    commentsCache.setEnabled(enabled);
    console.log(`[YAP SERVICE] Comments cache ${enabled ? 'enabled' : 'disabled'}`);
  },

  /**
   * Check if caching is enabled
   */
  isEnabled(): boolean {
    return commentsCache.isEnabled();
  },
};