import z from 'zod';

// --- BASE SCHEMAS ---

export const tikTokHandleSchema = z
  .string()
  .min(1, 'TikTok handle is required')
  .max(24, 'TikTok handle must be less than 24 characters')
  .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid TikTok handle format');

export const tikTokUserIdSchema = z
  .string()
  .min(1, 'User ID is required')
  .regex(/^\d+$/, 'User ID must be numeric');

// --- REQUEST SCHEMAS ---

export const rankingRequestSchema = z.object({
  handle: tikTokHandleSchema,
  user_id: tikTokUserIdSchema.optional(),
  force_refresh: z.boolean().optional().default(false),
});

export const smartFollowerManagementSchema = z.object({
  profile_handle: tikTokHandleSchema,
  action: z.enum(['add', 'remove'], {
    required_error: 'Action is required',
    invalid_type_error: 'Action must be either "add" or "remove"',
  }),
});

export const leaderboardQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1, 'Page must be at least 1')),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50))
    .pipe(
      z
        .number()
        .int()
        .min(1, 'Limit must be at least 1')
        .max(100, 'Limit cannot exceed 100'),
    ),
  is_seed_account: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      return val === 'true';
    })
    .pipe(z.boolean().optional()),
});

export const scraperOptionsSchema = z.object({
  handle: tikTokHandleSchema.optional(),
  user_id: tikTokUserIdSchema.optional(),
  min_time: z.number().int().optional(),
  trim: z.boolean().optional().default(true),
  max_pages: z.number().int().min(1).max(20).optional().default(5),
  force_refresh: z.boolean().optional().default(false),
});

// Ensure at least one of handle or user_id is provided
export const scraperParamsSchema = scraperOptionsSchema.refine(
  (data) => data.handle || data.user_id,
  {
    message: 'Either handle or user_id must be provided',
    path: ['handle'],
  },
);

// --- RESPONSE SCHEMAS ---

export const tikTokProfileSchema = z.object({
  id: z.string(),
  unique_id: z.string(),
  user_id: z.string().optional(),
  sec_uid: z.string().optional(),
  nickname: z.string().optional(),
  avatar_url: z.string().url().optional(),
  follower_count: z.number().int().min(0),
  following_count: z.number().int().min(0),
  aweme_count: z.number().int().min(0),
  region: z.string().optional(),
  verification_type: z.number().int(),
  is_seed_account: z.boolean(),
  known_followers_count: z.number().int().min(0),
  follower_rank_sum: z.number().min(0),
  weighted_follower_score: z.number().min(0).max(100),
  trust_depth: z.number().int().min(0),
  rank_score: z.number().min(0).max(100),
  last_scraped_at: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const rankingInfoSchema = z.object({
  rank_score: z.number().min(0).max(100),
  rank_type: z.enum(['trust_propagation', 'follower_based']),
  total_followers: z.number().int().min(0),
  known_followers: z.number().int().min(0),
  trust_depth: z.number().int().min(0),
  rank_percentile: z.number().min(0).max(100).optional(),
});

export const rankingResponseSchema = z.object({
  profile: tikTokProfileSchema,
  ranking: rankingInfoSchema,
  last_updated: z.string(),
});

export const smartFollowerManagementResponseSchema = z.object({
  success: z.boolean(),
  profile: tikTokProfileSchema,
  message: z.string(),
});

export const seedAccountManagementSchema = z.object({
  profile_handle: tikTokHandleSchema,
  action: z.enum(['add', 'remove'], {
    required_error: 'Action is required',
    invalid_type_error: 'Action must be either "add" or "remove"',
  }),
});

export const seedAccountManagementResponseSchema = z.object({
  success: z.boolean(),
  profile: tikTokProfileSchema,
  message: z.string(),
});

export const seedAccountsListResponseSchema = z.object({
  seed_accounts: z.array(tikTokProfileSchema),
  total_count: z.number().int().min(0),
});

export const paginationSchema = z.object({
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  has_more: z.boolean(),
});

export const leaderboardResponseSchema = z.object({
  profiles: z.array(tikTokProfileSchema),
  pagination: paginationSchema,
});

export const smartFollowersListResponseSchema = z.object({
  smart_followers: z.array(tikTokProfileSchema),
  total_count: z.number().int().min(0),
});

// --- PATH PARAMETER SCHEMAS ---

export const profileIdParamSchema = z.object({
  id: z.string().uuid('Invalid profile ID format'),
});

export const profileHandleParamSchema = z.object({
  handle: tikTokHandleSchema,
});

// --- TYPE EXPORTS ---

export type RankingRequestInput = z.infer<typeof rankingRequestSchema>;
export type SmartFollowerManagementInput = z.infer<
  typeof smartFollowerManagementSchema
>;
export type SeedAccountManagementInput = z.infer<
  typeof seedAccountManagementSchema
>;
export type LeaderboardQueryInput = z.infer<typeof leaderboardQuerySchema>;
export type ScraperOptionsInput = z.infer<typeof scraperOptionsSchema>;
export type ScraperParamsInput = z.infer<typeof scraperParamsSchema>;
export type TikTokProfileOutput = z.infer<typeof tikTokProfileSchema>;
export type RankingResponseOutput = z.infer<typeof rankingResponseSchema>;
export type SmartFollowerManagementResponseOutput = z.infer<
  typeof smartFollowerManagementResponseSchema
>;
export type SeedAccountManagementResponseOutput = z.infer<
  typeof seedAccountManagementResponseSchema
>;
export type LeaderboardResponseOutput = z.infer<
  typeof leaderboardResponseSchema
>;
export type SmartFollowersListResponseOutput = z.infer<
  typeof smartFollowersListResponseSchema
>;
export type SeedAccountsListResponseOutput = z.infer<
  typeof seedAccountsListResponseSchema
>;
export type ProfileIdParamInput = z.infer<typeof profileIdParamSchema>;
export type ProfileHandleParamInput = z.infer<typeof profileHandleParamSchema>;

// --- VALIDATION HELPERS ---

export const validateTikTokHandle = (handle: string): boolean => {
  try {
    tikTokHandleSchema.parse(handle);
    return true;
  } catch {
    return false;
  }
};

export const validateTikTokUserId = (userId: string): boolean => {
  try {
    tikTokUserIdSchema.parse(userId);
    return true;
  } catch {
    return false;
  }
};

export const sanitizeTikTokHandle = (handle: string): string => {
  // Remove @ prefix if present
  let sanitized = handle.startsWith('@') ? handle.slice(1) : handle;

  // Convert to lowercase
  sanitized = sanitized.toLowerCase();

  // Remove any whitespace
  sanitized = sanitized.trim();

  return sanitized;
};
