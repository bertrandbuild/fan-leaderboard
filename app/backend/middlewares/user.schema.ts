import z from 'zod';

// --- BASE SCHEMAS ---

export const evmAddressSchema = z
  .string()
  .min(1, 'EVM address is required')
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM address format');

export const userRoleSchema = z
  .enum(['user', 'club_admin'], {
    required_error: 'Role is required',
    invalid_type_error: 'Role must be either "user" or "club_admin"',
  });

export const twitterIdSchema = z
  .string()
  .min(1, 'Twitter ID is required')
  .max(50, 'Twitter ID must be less than 50 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Invalid Twitter ID format')
  .optional();

export const youtubeIdSchema = z
  .string()
  .min(1, 'YouTube ID is required')
  .max(100, 'YouTube ID must be less than 100 characters')
  .optional();

export const telegramIdSchema = z
  .string()
  .min(1, 'Telegram ID is required')
  .max(50, 'Telegram ID must be less than 50 characters')
  .optional();

export const tiktokIdSchema = z
  .string()
  .min(1, 'TikTok handle is required')
  .max(50, 'TikTok handle must be less than 50 characters')
  .regex(/^[a-zA-Z0-9_.]+$/, 'Invalid TikTok handle format')
  .optional();

export const tiktokAccountSchema = z
  .string()
  .uuid('Invalid TikTok account ID format')
  .optional();

export const fanTokensSchema = z
  .array(evmAddressSchema)
  .default([])
  .optional();

// --- REQUEST SCHEMAS ---

export const userCreateRequestSchema = z.object({
  evm_address: evmAddressSchema,
  role: userRoleSchema.default('user').optional(),
  twitter_id: twitterIdSchema,
  youtube_id: youtubeIdSchema,
  telegram_id: telegramIdSchema,
  tiktok_id: tiktokIdSchema,
});

export const userUpdateRequestSchema = z.object({
  role: userRoleSchema.optional(),
  twitter_id: twitterIdSchema,
  youtube_id: youtubeIdSchema,
  telegram_id: telegramIdSchema,
  tiktok_id: tiktokIdSchema,
});

export const userRoleUpdateRequestSchema = z.object({
  role: userRoleSchema,
});

export const fanTokenValidationRequestSchema = z.object({
  evm_address: evmAddressSchema,
});

export const userQuerySchema = z.object({
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
  role: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      return val as 'user' | 'club_admin';
    })
    .pipe(userRoleSchema.optional()),
});

// --- RESPONSE SCHEMAS ---

export const userSchema = z.object({
  id: z.string().uuid(),
  evm_address: evmAddressSchema,
  role: userRoleSchema,
  twitter_id: z.string().optional(),
  youtube_id: z.string().optional(),
  telegram_id: z.string().optional(),
  tiktok_id: z.string().optional(),
  tiktok_account: z.string().optional(),
  fan_tokens: fanTokensSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export const tikTokProfileSummarySchema = z.object({
  id: z.string(),
  unique_id: z.string(),
  nickname: z.string().optional(),
  avatar_url: z.string().optional(),
  follower_count: z.number().int().min(0),
  rank_score: z.number().min(0).max(100),
  known_followers_count: z.number().int().min(0),
});

export const userProfileResponseSchema = z.object({
  user: userSchema,
  tiktok_profile: tikTokProfileSummarySchema.optional(),
});

export const fanTokenValidationResponseSchema = z.object({
  fan_tokens: fanTokensSchema,
  is_valid: z.boolean(),
});

export const paginationSchema = z.object({
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  has_more: z.boolean(),
});

export const usersListResponseSchema = z.object({
  users: z.array(userSchema),
  pagination: paginationSchema,
});

export const clubAdminsListResponseSchema = z.object({
  club_admins: z.array(userSchema),
  total_count: z.number().int().min(0),
});

// --- PATH PARAMETER SCHEMAS ---

export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

export const evmAddressParamSchema = z.object({
  address: evmAddressSchema,
});

// --- TYPE EXPORTS ---

export type UserCreateRequestInput = z.infer<typeof userCreateRequestSchema>;
export type UserUpdateRequestInput = z.infer<typeof userUpdateRequestSchema>;
export type UserRoleUpdateRequestInput = z.infer<typeof userRoleUpdateRequestSchema>;
export type FanTokenValidationRequestInput = z.infer<typeof fanTokenValidationRequestSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
export type UserOutput = z.infer<typeof userSchema>;
export type UserProfileResponseOutput = z.infer<typeof userProfileResponseSchema>;
export type FanTokenValidationResponseOutput = z.infer<typeof fanTokenValidationResponseSchema>;
export type UsersListResponseOutput = z.infer<typeof usersListResponseSchema>;
export type ClubAdminsListResponseOutput = z.infer<typeof clubAdminsListResponseSchema>;
export type UserIdParamInput = z.infer<typeof userIdParamSchema>;
export type EvmAddressParamInput = z.infer<typeof evmAddressParamSchema>;

// --- VALIDATION UTILITIES ---

export const validateEvmAddress = (address: string): boolean => {
  const result = evmAddressSchema.safeParse(address);
  return result.success;
};

export const sanitizeEvmAddress = (address: string): string => {
  return address.toLowerCase().trim();
};

export const validateTwitterId = (twitterId: string): boolean => {
  const result = twitterIdSchema.safeParse(twitterId);
  return result.success;
};

export const sanitizeTwitterId = (twitterId: string): string => {
  return twitterId.replace(/^@/, '').trim();
};

export const validateTikTokHandle = (handle: string): boolean => {
  const result = tiktokIdSchema.safeParse(handle);
  return result.success;
};

export const sanitizeTikTokHandle = (handle: string): string => {
  return handle.replace(/^@/, '').trim();
}; 