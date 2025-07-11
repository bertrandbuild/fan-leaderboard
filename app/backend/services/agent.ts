import * as db from '../database/db';
import { agentManager } from './letta/letta-agents';
import type { IAgent } from '../types';
import { parseTemplate } from '../data/prompts';
import * as templates from '../data/prompts';
import { config } from '../config/index';

export const agentService = {
  // List all local agents, optionally enriched with Letta data
  list: async (withLetta: boolean = false) => {
    const agents = db.listAgents();
    if (!withLetta) return agents;
    // Enrich each agent with Letta data if requested
    const enriched = await Promise.all(
      agents.map(async (agent) => {
        try {
          const letta = await agentManager.getAgentByName(agent.details.name);
          return { ...agent, letta };
        } catch {
          return { ...agent, letta: null };
        }
      }),
    );
    return enriched;
  },

  // Get a single agent, optionally with Letta data
  get: async (id: string, withLetta: boolean = false) => {
    const agent = db.getAgentById(id);
    if (!agent) return null;
    if (!withLetta) return agent;
    try {
      const letta = await agentManager.getAgentByName(agent.details.name);
      return { ...agent, letta };
    } catch {
      return { ...agent, letta: null };
    }
  },

  // Create agent locally and in Letta
  create: async (agent: IAgent): Promise<string> => {
    try {
      // If no ID, leave Letta or the backend to generate it
      let agentId = agent.id;
      if (!agentId) {
        // Call Letta to create the agent and get the ID, or generate a UUID here if needed
        agentId = await agentService.getOrCreateLettaAgent(agent);
      }
      // Only update local DB if Letta succeeded
      await db.createAgent({ ...agent, id: agentId });
      return agentId;
    } catch (error) {
      console.error(
        `Error in agentService.create for agent ID ${agent.id}:`,
        error,
      );
      throw error;
    }
  },

  // Update agent locally and in Letta
  update: async (agent: IAgent): Promise<string> => {
    try {
      if (!agent.id) throw new Error('Agent ID is required');
      // Update Letta first
      let lettaId: string;
      try {
        const letta = await agentManager.getAgentById(agent.id);
        if (letta) {
          await agentManager.updateMemoryBlock(
            letta.id,
            'persona',
            agent.details.persona || '',
          );
          // if (
          //   agent.details.name === 'analyst-agent' &&
          //   agent.status === 'enabled'
          // )
          //   analystAgent.enable();
          // if (
          //   agent.details.name === 'analyst-agent' &&
          //   agent.status === 'disabled'
          // )
          //   analystAgent.disable();
          // TODO: update other letta fields
          // TODO: extend the update so "template agents" can have a custom update
          lettaId = letta.id;
        } else {
          lettaId = await agentService.getOrCreateLettaAgent(agent);
        }
      } catch (lettaError) {
        console.error(
          `Failed to update or create Letta agent for ID ${agent.id}:`,
          lettaError,
        );
        throw lettaError;
      }
      // Only update local DB if Letta succeeded
      await db.updateAgent({ ...agent, id: lettaId });
      return lettaId;
    } catch (error) {
      console.error(
        `Error in agentService.update for agent ID ${agent.id}:`,
        error,
      );
      throw error;
    }
  },

  // Delete agent locally and in Letta
  delete: async (id: string, agentName?: string): Promise<string> => {
    if (agentName) {
      try {
        const letta = await agentManager.getAgentByName(agentName);
        if (letta) {
          await agentManager.deleteAgent(letta.id);
        }
      } catch (error) {
        console.error(
          `Failed to delete Letta agent for name ${agentName}:`,
          error,
        );
        throw error;
      }
    }
    try {
      await db.deleteAgent(id);
      return id;
    } catch (error) {
      console.error(`Error deleting local agent with ID ${id}:`, error);
      throw error;
    }
  },

  // Sync all local agents with Letta (one-way: local -> Letta)
  syncToLetta: async () => {
    const agents = db.listAgents();
    for (const agent of agents) {
      try {
        await agentManager.getAgentByName(agent.details.name);
      } catch {
        await agentService.getOrCreateLettaAgent(agent);
      }
    }
  },

  // Helper to create or get a Letta agent from our IAgent type, with extra Letta options
  getOrCreateLettaAgent: async (
    agent: IAgent,
    lettaOptions: Partial<{
      userId: string;
      username: string;
      blockIds: string[];
      contextWindowLimit: number;
      embedding: any;
      memoryBlocks: any[];
    }> = {},
  ): Promise<string> => {
    return agentManager.getOrCreateAgent({
      agentName: agent.details.name,
      description: agent.details.description,
      systemPrompt: agent.details.systemPrompt || templates.systemPrompt,
      model: agent.details.model || config.model.modelConfig,
      memoryBlocks: lettaOptions.memoryBlocks || [
        { label: 'human', value: parseTemplate(templates.humanMemory, {}) },
        { label: 'persona', value: agent.details.persona, limit: 6000 },
      ],
      ...lettaOptions,
    });
  },

  // Helper to generate agent config for main
  buildAgentConfig: ({
    name,
    description,
    systemPrompt,
    persona,
    model,
    version = 1,
    id = '',
    status = 'disabled',
  }: {
    name: string;
    description: string;
    systemPrompt: string;
    persona: string;
    model: any;
    version?: number;
    id?: string;
    status?: 'enabled' | 'disabled' | 'pending';
  }): IAgent => {
    return {
      id,
      version,
      details: {
        name,
        description,
        systemPrompt,
        persona,
        model,
      },
      status,
    };
  },

  // Get or create the main agent (local + Letta)
  // The main agent is the one connected to the public Discord / Telegram server
  getOrCreateMainAgent: async () => {
    const agentName = 'main-agent';
    let agent = db.listAgents().find((a) => a.details.name === agentName);
    if (agent && agent.id) return agent.id;

    // Create agent config
    const newAgent: IAgent = agentService.buildAgentConfig({
      name: agentName,
      description: templates.mainAgentDescription,
      systemPrompt: templates.systemPrompt,
      persona: templates.botPersona,
      model: config.model.modelConfig,
      status: 'enabled',
    });

    // Create or get in Letta using the DRY helper
    const lettaId = await agentService.getOrCreateLettaAgent(newAgent, {
      blockIds: [],
      contextWindowLimit: 16000,
      embedding: config.model.embeddingConfig,
      memoryBlocks: [
        { label: 'human', value: templates.mainAgentHumanMemory, limit: 1000 },
        { label: 'persona', value: templates.botPersona, limit: 8000 },
      ],
    });

    // Create local agent
    await db.createAgent({ ...newAgent, id: lettaId });
    return lettaId;
  },

  enableAgent: async (id: string) => {
    const agent = await agentService.get(id);
    if (agent && agent.status !== 'enabled') {
      await agentService.update({ ...agent, status: 'enabled' });
    }
    // Optionally: call a hook for agent-specific logic
  },

  disableAgent: async (id: string) => {
    const agent = await agentService.get(id);
    if (agent && agent.status !== 'disabled') {
      await agentService.update({ ...agent, status: 'disabled' });
    }
    // Optionally: call a hook for agent-specific logic
  },
};
