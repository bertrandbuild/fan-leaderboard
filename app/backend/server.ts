import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config/index';
import routes from './routes/index';
import { errorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/not-found.middleware';
import { createApiLimiter } from './config/rateLimiter';
import { databaseService } from './services/database';
import './services/telegram-bot-manager';
import { agentService } from './services/agent';
import { telegramBotManager } from './services/telegram-bot-manager';

// Initialize express app
const app = express();
const PORT = config.app.port;
// Trust proxy - required when running behind a reverse proxy (like Docker)
app.set('trust proxy', 1);

// Middlewares Security & Parsing
app.use(helmet());
config.railway.envName === 'production'
  ? app.use(cors({ origin: config.app.corsOrigin }))
  : app.use(cors());
app.use(createApiLimiter);

// --- Middlewares globaux ---
app.use(express.json());

// --- Routes API ---
app.use('/api', routes);

// --- Middlewares ---
app.use(notFoundHandler);
app.use(errorHandler);

// TODO: refactor to use a generic agent template
(async () => {
  try {
    // Initialize database connection
    await databaseService.connect();
    
    // Only initialize bot if environment variables are present
    if (config.letta.token && config.letta.baseUrl && config.telegram.botId) {
      const mainAgentId = await agentService.getOrCreateMainAgent();
      await telegramBotManager.start(mainAgentId);
    } else {
      console.log('🤖 Bot initialization skipped (missing environment variables)');
    }
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
})();

function shutdown() {
  console.log('🛑 Shutting down gracefully...');
  
  // Cleanup database connection
  databaseService.disconnect().then(() => {
    console.log('📊 Database connection closed');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Error closing database connection:', error);
    process.exit(1);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start the server
app.listen(PORT, () => {
  console.log(`🌐 Server listening on port ${PORT}`);
});
