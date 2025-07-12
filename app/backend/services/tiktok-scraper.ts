import { config } from '../config/index';
import { ApiCache } from '../utils/api-cache';
import { logScraperCall } from '../database/db';
import type { IScrapeCreatorsApiResponse, ITikTokUser } from '../types';

// Initialize cache
const cache = ApiCache.getInstance('tiktok-scraper');

export interface ScrapeCreatorsParams {
  handle?: string;
  user_id?: string;
  min_time?: number;
  trim?: boolean;
}

export interface TikTokScraperError extends Error {
  status?: number;
  code?: string;
}

export const tikTokScraperService = {
  /**
   * Generate a cache key for a scraper request
   * @param params - Scraper parameters
   * @returns A cache key string
   */
  generateCacheKey: (params: ScrapeCreatorsParams): string => {
    const key = `${params.handle || params.user_id}:${params.min_time || 0}:${params.trim || false}`;
    return ApiCache.hashKey(key);
  },

  /**
   * Fetch following (who a user follows) for a TikTok profile using ScrapeCreators API
   * @param params - Parameters for the API call
   * @returns The API response with following data
   */
  fetchFollowing: async (
    params: ScrapeCreatorsParams,
  ): Promise<IScrapeCreatorsApiResponse> => {
    const startTime = Date.now();
    const profileHandle = params.handle || params.user_id || 'unknown';

    try {
      // Validate required parameters
      if (!params.handle && !params.user_id) {
        throw new Error('Either handle or user_id is required');
      }

      // Check if API key is configured
      if (!config.scrapeCreators.apiKey) {
        throw new Error('ScrapeCreators API key is not configured');
      }

      // Check cache first
      const cacheKey = tikTokScraperService.generateCacheKey(params);
      const cachedResponse = cache.get(cacheKey);

      if (cachedResponse) {
        console.log(`Cache hit for TikTok following: ${profileHandle}`);
        return cachedResponse;
      }

      // Prepare API request for following endpoint
      const url = new URL(
        '/v1/tiktok/user/following',
        config.scrapeCreators.baseUrl,
      );

      // Add query parameters
      if (params.handle) url.searchParams.append('handle', params.handle);
      if (params.user_id) url.searchParams.append('user_id', params.user_id);
      if (params.min_time)
        url.searchParams.append('min_time', params.min_time.toString());
      if (params.trim !== undefined)
        url.searchParams.append('trim', params.trim.toString());

      console.log(`Fetching TikTok following for: ${profileHandle}`);

      // Make the API request
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'x-api-key': config.scrapeCreators.apiKey,
          'User-Agent': 'ThePeel-Social-Ranking/1.0',
        },
      });

      const responseData = await response.json();
      const duration = Date.now() - startTime;

      // Log the API call
      await logScraperCall({
        profile_handle: profileHandle,
        api_endpoint: url.pathname,
        success: response.ok,
        response_code: response.status,
        error_message: response.ok
          ? undefined
          : responseData.message || 'Unknown error',
        followers_fetched: response.ok
          ? responseData.followings?.length || 0
          : 0,
        api_call_duration_ms: duration,
      });

      if (!response.ok) {
        const error: TikTokScraperError = new Error(
          `ScrapeCreators API error: ${responseData.message || 'Unknown error'}`,
        );
        error.status = response.status;
        error.code = responseData.code;
        throw error;
      }

      // Add debug logging to understand response structure
      console.log(`API Response structure for ${profileHandle}:`, {
        statusCode: response.status,
        hasFollowings: 'followings' in responseData,
        followingsType: typeof responseData.followings,
        followingsLength: responseData.followings?.length,
        responseKeys: Object.keys(responseData),
        sampleResponse: JSON.stringify(responseData, null, 2).substring(0, 500) + '...'
      });

      // Validate response structure - API returns 'followings' (plural)
      if (!Array.isArray(responseData.followings)) {
        // Si la clé n'existe pas ou n'est pas un tableau, on considère qu'il n'y a pas de followings
        console.warn(`No followings array for ${profileHandle}, returning empty array`);
        responseData.followings = [];
      }

      // Normalize the response to match our expected format
      responseData.following = responseData.followings;

      console.log(
        `Successfully fetched ${responseData.following.length} following for ${profileHandle}`,
      );

      // Cache the successful response
      cache.set(cacheKey, responseData);

      return responseData as IScrapeCreatorsApiResponse;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log failed API call
      await logScraperCall({
        profile_handle: profileHandle,
        api_endpoint: '/v1/tiktok/user/following',
        success: false,
        response_code: (error as TikTokScraperError).status,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        followers_fetched: 0,
        api_call_duration_ms: duration,
      });

      console.error(
        `Error fetching TikTok following for ${profileHandle}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Fetch followers for a TikTok profile using ScrapeCreators API
   * @param params - Parameters for the API call
   * @returns The API response with followers data
   */
  fetchFollowers: async (
    params: ScrapeCreatorsParams,
  ): Promise<IScrapeCreatorsApiResponse> => {
    const startTime = Date.now();
    const profileHandle = params.handle || params.user_id || 'unknown';

    try {
      // Validate required parameters
      if (!params.handle && !params.user_id) {
        throw new Error('Either handle or user_id is required');
      }

      // Check if API key is configured
      if (!config.scrapeCreators.apiKey) {
        throw new Error('ScrapeCreators API key is not configured');
      }

      // Check cache first
      const cacheKey = tikTokScraperService.generateCacheKey(params);
      const cachedResponse = cache.get(cacheKey);

      if (cachedResponse) {
        console.log(`Cache hit for TikTok profile: ${profileHandle}`);
        return cachedResponse;
      }

      // Prepare API request
      const url = new URL(
        '/v1/tiktok/user/followers',
        config.scrapeCreators.baseUrl,
      );

      // Add query parameters
      if (params.handle) url.searchParams.append('handle', params.handle);
      if (params.user_id) url.searchParams.append('user_id', params.user_id);
      if (params.min_time)
        url.searchParams.append('min_time', params.min_time.toString());
      if (params.trim !== undefined)
        url.searchParams.append('trim', params.trim.toString());

      console.log(`Fetching TikTok followers for: ${profileHandle}`);

      // Make the API request
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'x-api-key': config.scrapeCreators.apiKey,
          'User-Agent': 'ThePeel-Social-Ranking/1.0',
        },
      });

      const responseData = await response.json();
      const duration = Date.now() - startTime;

      // Log the API call
      await logScraperCall({
        profile_handle: profileHandle,
        api_endpoint: url.pathname,
        success: response.ok,
        response_code: response.status,
        error_message: response.ok
          ? undefined
          : responseData.message || 'Unknown error',
        followers_fetched: response.ok
          ? responseData.followers?.length || 0
          : 0,
        api_call_duration_ms: duration,
      });

      if (!response.ok) {
        const error: TikTokScraperError = new Error(
          `ScrapeCreators API error: ${responseData.message || 'Unknown error'}`,
        );
        error.status = response.status;
        error.code = responseData.code;
        throw error;
      }

      // Validate response structure
      if (!responseData.followers || !Array.isArray(responseData.followers)) {
        throw new Error(
          'Invalid response format: missing or invalid followers array',
        );
      }

      console.log(
        `Successfully fetched ${responseData.followers.length} followers for ${profileHandle}`,
      );

      // Cache the successful response
      cache.set(cacheKey, responseData);

      return responseData as IScrapeCreatorsApiResponse;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log failed API call
      await logScraperCall({
        profile_handle: profileHandle,
        api_endpoint: '/v1/tiktok/user/followers',
        success: false,
        response_code: (error as TikTokScraperError).status,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        followers_fetched: 0,
        api_call_duration_ms: duration,
      });

      console.error(
        `Error fetching TikTok followers for ${profileHandle}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Fetch all following for a profile with pagination
   * @param params - Initial parameters
   * @param maxPages - Maximum number of pages to fetch (default: 10)
   * @returns Array of all following
   */
  fetchAllFollowing: async (
    params: ScrapeCreatorsParams,
    maxPages: number = 10,
  ): Promise<ITikTokUser[]> => {
    const allFollowing: ITikTokUser[] = [];
    let currentParams = { ...params };
    let pageCount = 0;

    try {
      while (pageCount < maxPages) {
        console.log(`Fetching page ${pageCount + 1} for following...`);
        const response =
          await tikTokScraperService.fetchFollowing(currentParams);

        // Add current page results
        const currentPageFollowing = response.following || [];
        allFollowing.push(...currentPageFollowing);
        
        console.log(`Page ${pageCount + 1}: fetched ${currentPageFollowing.length} following`);
        console.log(`Total so far: ${allFollowing.length}`);
        console.log(`Response has_more: ${response.has_more}`);
        console.log(`Response min_time: ${response.min_time}`);
        console.log(`Response total: ${response.total}`);

        // Check if we should continue pagination
        const shouldContinue = response.has_more && response.min_time;
        const hasMoreData = response.total ? allFollowing.length < response.total : false;
        
        console.log(`Should continue: ${shouldContinue}, Has more data: ${hasMoreData}`);
        
        if (!shouldContinue && !hasMoreData) {
          console.log(`Stopping pagination: no more data available`);
          break;
        }

        // If we have all the data based on total count, stop
        if (response.total && allFollowing.length >= response.total) {
          console.log(`Stopping pagination: fetched all ${response.total} items`);
          break;
        }

        // Prepare for next page
        currentParams.min_time = response.min_time;
        pageCount++;

        // Add a small delay to be respectful to the API
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      console.log(
        `Fetched total of ${allFollowing.length} following across ${pageCount + 1} pages`,
      );
      return allFollowing;
    } catch (error) {
      console.error('Error fetching all following:', error);
      throw error;
    }
  },

  /**
   * Fetch all followers for a profile with pagination
   * @param params - Initial parameters
   * @param maxPages - Maximum number of pages to fetch (default: 10)
   * @returns Array of all followers
   */
  fetchAllFollowers: async (
    params: ScrapeCreatorsParams,
    maxPages: number = 10,
  ): Promise<ITikTokUser[]> => {
    const allFollowers: ITikTokUser[] = [];
    let currentParams = { ...params };
    let pageCount = 0;

    try {
      while (pageCount < maxPages) {
        const response =
          await tikTokScraperService.fetchFollowers(currentParams);

        allFollowers.push(...(response.followers || []));

        if (!response.has_more || !response.min_time) {
          break;
        }

        // Prepare for next page
        currentParams.min_time = response.min_time;
        pageCount++;

        // Add a small delay to be respectful to the API
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      console.log(
        `Fetched total of ${allFollowers.length} followers across ${pageCount + 1} pages`,
      );
      return allFollowers;
    } catch (error) {
      console.error('Error fetching all followers:', error);
      throw error;
    }
  },

  /**
   * Extract basic profile info from the first follower's data or API response
   * @param response - The API response
   * @returns Basic profile information
   */
  extractProfileInfo: (
    response: IScrapeCreatorsApiResponse,
  ): Partial<ITikTokUser> | null => {
    if (!response.followers || response.followers.length === 0) {
      return null;
    }

    // We can't get the target profile info directly from followers endpoint
    // This would need to be combined with a profile endpoint or derived from other means
    return {
      user_id: response.myself_user_id,
      // Other fields would need to come from a separate profile endpoint
    };
  },

  /**
   * Check if the service is properly configured
   * @returns True if the service can make API calls
   */
  isConfigured: (): boolean => {
    return !!(config.scrapeCreators.apiKey && config.scrapeCreators.baseUrl);
  },

  /**
   * Clear cache for a specific profile
   * @param params - Parameters to clear cache for
   */
  clearCache: (params: ScrapeCreatorsParams): void => {
    const cacheKey = tikTokScraperService.generateCacheKey(params);
    cache.delete(cacheKey);
  },

  /**
   * Clear all TikTok scraper cache
   */
  clearAllCache: (): void => {
    cache.clear();
  },
};
