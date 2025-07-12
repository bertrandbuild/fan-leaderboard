import z from 'zod';
import { config as dotenvConfig } from 'dotenv';

// Load the base .env
dotenvConfig();

// Define Zod schema for environment variables
const envSchema = z.object({
  // Database Configuration
  DATABASE_URL: z.string().min(1),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Letta Configuration (optional)
  LETTA_TOKEN: z.string().min(1).optional(),
  LETTA_BASE_URL: z.string().url().optional(),
  LETTA_USE_SENDER_PREFIX: z
    .preprocess((val: unknown) => val === 'true', z.boolean())
    .default(true),

  // Telegram Bot Configuration (optional)
  TELEGRAM_BOT_ID: z.string().min(1).optional(),
  RESPOND_TO_DMS: z
    .preprocess((val: unknown) => val === 'true', z.boolean())
    .default(true),
  RESPOND_TO_MENTIONS: z
    .preprocess((val: unknown) => val === 'true', z.boolean())
    .default(true),
  RESPOND_TO_BOTS: z
    .preprocess((val: unknown) => val === 'true', z.boolean())
    .default(false),
  RESPOND_TO_GENERIC: z
    .preprocess((val: unknown) => val === 'true', z.boolean())
    .default(true),
  SURFACE_ERRORS: z
    .preprocess((val: unknown) => val === 'true', z.boolean())
    .default(false),
  LLM_DECIDES_GROUP_RESPONSE: z
    .preprocess((val: unknown) => val === 'true', z.boolean())
    .default(false),

  // App Configuration
  PORT: z
    .preprocess(
      (val: unknown) => parseInt(String(val), 10),
      z.number().positive(),
    )
    .default(3000),
  CORS_ORIGIN: z.string().url().optional(),

  // Embedding Configuration
  EMBEDDING_CONFIG: z.string().default('openai/text-embedding-3-small'),
  MODEL_CONFIG: z.string().default('openai/gpt-4o-mini'),

  // OpenAI Configuration (optional)
  OPENAI_API_KEY: z.string().min(1).optional(),

});

// Parse environment variables
const envVars = envSchema.safeParse(process.env);

// Handle validation errors
if (!envVars.success) {
  console.error('❌ Invalid environment variables:');
  console.error(envVars.error.format());
  throw new Error('Invalid environment configuration');
}

// Export typed and validated config
export const config = {
  env: process.env.NODE_ENV,
  railway: {
    // see Railway defaults env
    envName: process.env.RAILWAY_ENVIRONMENT_NAME,
  },
  database: {
    url: envVars.data.DATABASE_URL,
  },
  jwt: {
    secret: envVars.data.JWT_SECRET,
    expiresIn: envVars.data.JWT_EXPIRES_IN,
  },
  letta: {
    token: envVars.data.LETTA_TOKEN,
    baseUrl: envVars.data.LETTA_BASE_URL,
    useSenderPrefix: envVars.data.LETTA_USE_SENDER_PREFIX,
  },
  telegram: {
    botId: envVars.data.TELEGRAM_BOT_ID,
    respondToDms: envVars.data.RESPOND_TO_DMS,
    respondToMentions: envVars.data.RESPOND_TO_MENTIONS,
    respondToBots: envVars.data.RESPOND_TO_BOTS,
    respondToGeneric: envVars.data.RESPOND_TO_GENERIC,
    surfaceErrors: envVars.data.SURFACE_ERRORS,
    llmDecidesGroupResponse: envVars.data.LLM_DECIDES_GROUP_RESPONSE,
  },
  app: {
    port: envVars.data.PORT,
    corsOrigin: envVars.data.CORS_ORIGIN,
  },
  model: {
    modelConfig: envVars.data.MODEL_CONFIG,
    embeddingConfig: envVars.data.EMBEDDING_CONFIG,
  },
  openai: {
    apiKey: envVars.data.OPENAI_API_KEY,
  },
};

export default config;
