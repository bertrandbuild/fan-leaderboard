import { TelegramBot } from './telegram-bot';

export class TelegramBotManager {
  private bots: Map<string, TelegramBot> = new Map();

  public async start(agentId: string) {
    if (!this.bots.has(agentId)) {
      const bot = new TelegramBot();
      await bot.start(agentId);
      this.bots.set(agentId, bot);
    } else {
      await this.bots.get(agentId)!.start(agentId);
    }
  }

  public stop(agentId: string) {
    if (this.bots.has(agentId)) {
      this.bots.get(agentId)!.stop();
      this.bots.delete(agentId);
    }
  }

  public isRunning(agentId: string) {
    return this.bots.has(agentId) && this.bots.get(agentId)!.isRunning();
  }
}

export const telegramBotManager = new TelegramBotManager();