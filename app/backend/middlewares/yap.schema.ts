import { z } from 'zod';

// TikTok URL validation regex patterns
const TIKTOK_URL_PATTERNS = [
  /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
  /^https?:\/\/(vm\.)?tiktok\.com\/[\w-]+/,
  /^https?:\/\/(www\.)?tiktok\.com\/t\/[\w-]+/,
];

const tikTokUrlSchema = z.string().refine(
  (url) => TIKTOK_URL_PATTERNS.some(pattern => pattern.test(url)),
  {
    message: 'Invalid TikTok video URL format',
  }
);

// Calculate yap score schema
export const calculateYapScoreSchema = z.object({
  query: z.object({
    videoUrl: tikTokUrlSchema,
  }),
});

// Process yap schema
export const processYapSchema = z.object({
  body: z.object({
    videoUrl: tikTokUrlSchema,
    profileId: z.string().uuid().optional(),
  }),
});

// Batch process yaps schema
export const batchProcessYapsSchema = z.object({
  body: z.object({
    videoUrls: z.array(tikTokUrlSchema).min(1).max(50),
    profileId: z.string().uuid().optional(),
    maxConcurrent: z.number().min(1).max(10).default(3),
  }),
});

// Get yap by ID schema
export const getYapByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// Get yap by URL schema
export const getYapByUrlSchema = z.object({
  params: z.object({
    videoUrl: z.string(),
  }),
});

// Get yaps by profile schema
export const getYapsByProfileSchema = z.object({
  params: z.object({
    profileId: z.string().uuid(),
  }),
});

// Get interactions by profile schema
export const getInteractionsByProfileSchema = z.object({
  params: z.object({
    profileId: z.string().uuid(),
  }),
});

// Recalculate yap score schema
export const recalculateYapScoreSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// Delete yap schema
export const deleteYapSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// Get yap leaderboard schema
export const getYapLeaderboardSchema = z.object({
  query: z.object({
    limit: z.string().regex(/^\d+$/).transform(Number).refine(val => val <= 200, {
      message: 'Maximum limit is 200',
    }).default('50'),
  }),
});

// Get yap profile ranking schema
export const getYapProfileRankingSchema = z.object({
  query: z.object({
    limit: z.string().regex(/^\d+$/).transform(Number).refine(val => val <= 500, {
      message: 'Maximum limit is 500',
    }).default('100'),
  }),
});

// Search yaps by creator schema
export const searchYapsByCreatorSchema = z.object({
  query: z.object({
    username: z.string().min(1).max(50),
  }),
});

// List yaps schema
export const listYapsSchema = z.object({
  query: z.object({
    profileId: z.string().uuid().optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).refine(val => val <= 200, {
      message: 'Maximum limit is 200',
    }).default('100'),
    offset: z.string().regex(/^\d+$/).transform(Number).default('0'),
  }),
});

// Get yap interactions schema
export const getYapInteractionsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// Common validation functions
export const validateTikTokUrl = (url: string): boolean => {
  return TIKTOK_URL_PATTERNS.some(pattern => pattern.test(url));
};

export const extractVideoIdFromUrl = (url: string): string | null => {
  const patterns = [
    /\/video\/(\d+)/,
    /\/v\/(\d+)/,
    /tiktok\.com\/.*\/video\/(\d+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

// Middleware function to validate schemas
export const validateSchema = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }
      next(error);
    }
  };
}; 