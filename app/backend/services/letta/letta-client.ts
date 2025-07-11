import { LettaClient } from '@letta-ai/letta-client';
import { config } from '../../config';

class LettaManager {
  private static readonly client = new LettaClient({
    baseUrl: config.letta.baseUrl,
    token: config.letta.token,
  });

  private constructor() {}

  public static getClient(): LettaClient {
    return LettaManager.client;
  }
}

export const lettaClient = LettaManager.getClient();
