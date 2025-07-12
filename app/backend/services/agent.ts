// Basic agent service placeholder
class AgentService {
  async getOrCreateMainAgent(): Promise<string> {
    // Return a dummy agent ID for now
    return 'main-agent-placeholder';
  }
}

export const agentService = new AgentService();