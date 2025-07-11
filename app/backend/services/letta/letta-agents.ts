import { lettaClient } from './letta-client';
import { LettaClient } from '@letta-ai/letta-client';
import { IAgentName } from '../../types';
import { config } from '../../config/index';
import { AgentState } from '@letta-ai/letta-client/api';

/**
 * Manages Letta agent mappings for Discord conversations.
 */
class AgentManager {
  private static readonly AGENT_PREFIX = 'agent';
  private readonly lettaClient: LettaClient;
  private readonly MODEL: string;
  private readonly MAX_CONTEXT_WINDOW_LIMIT: number;
  private readonly EMBEDDING: string;
  constructor() {
    this.lettaClient = lettaClient;
    this.MODEL = config.model.modelConfig;
    this.MAX_CONTEXT_WINDOW_LIMIT = 16000;
    this.EMBEDDING = config.model.embeddingConfig;
  }

  /**
   * Generates a unique and meaningful agent name combining user and channel information
   */
  public generateAgentName(userId: string, channelId: string): IAgentName {
    return `${AgentManager.AGENT_PREFIX}_${userId}_${channelId}` as IAgentName;
  }

  /**
   * Checks if an agent exists by name
   * @param name - The name of the agent to check
   * @returns Promise<AgentState | null> - The agent if found, null otherwise
   */
  private async findAgent(name: string): Promise<AgentState | null> {
    try {
      const agents = await this.lettaClient.agents.list({
        name: name,
        limit: 1,
      });
      console.log(`🤖 Found ${agents.length} agents with name: ${name}`);
      return agents[0] || null;
    } catch (error) {
      console.error(`Failed to search for agent: ${name}`, error);
      throw error;
    }
  }

  /**
   * Retrieves an existing agent by name
   * @param agentName - The name of the agent to retrieve
   * @returns Promise<AgentState | null> - The agent if found, null otherwise
   */
  public async getAgent(agentName: string): Promise<AgentState | null> {
    return await this.findAgent(agentName);
  }

  /**
   * Retrieves an existing agent by ID
   * @param agentId - The ID of the agent to retrieve
   * @returns Promise<AgentState | null> - The agent if found, null otherwise
   */
  public async getAgentById(agentId: string): Promise<AgentState | null> {
    return await this.lettaClient.agents.retrieve(agentId);
  }

  /**
   * Gets an existing Letta agent by name, or creates a new one if it doesn't exist.
   * If userId and username are provided, associates identity. Otherwise, creates a generic agent.
   *
   * @param params - Either { agentName, userId, username, ...fields } or { name, description, systemPrompt, model, memoryBlocks }
   * @returns Promise<string> - The agent ID
   */
  public async getOrCreateAgent(params: {
    agentName?: string;
    userId?: string;
    username?: string;
    name?: string;
    description?: string;
    systemPrompt?: string;
    model?: string;
    memoryBlocks?: any[];
    blockIds?: string[];
    contextWindowLimit?: number;
    embedding?: string;
  }): Promise<string> {
    const agentName = params.agentName || params.name;
    if (!agentName) throw new Error('Agent name is required');
    const existing = await this.getAgent(agentName);
    if (existing) {
      return existing.id;
    }
    if (params.agentName && params.userId && params.username) {
      // Create agent with or without identity based on availability
      const agentConfig: any = {
        name: params.agentName,
        system: params.systemPrompt || '',
        description: params.description || '',
        memoryBlocks: params.memoryBlocks || [],
        blockIds: params.blockIds || [],
        model: params.model || this.MODEL,
        contextWindowLimit:
          params.contextWindowLimit || this.MAX_CONTEXT_WINDOW_LIMIT,
        embedding: params.embedding || this.EMBEDDING,
      };

      const lettaAgent = await this.lettaClient.agents.create(agentConfig);
      return lettaAgent.id;
    } else if (params.agentName) {
      // Generic agent creation (without a user identity)
      const lettaAgent = await this.lettaClient.agents.create({
        name: params.agentName,
        system: params.systemPrompt || '',
        description: params.description || '',
        memoryBlocks: params.memoryBlocks || [],
        blockIds: params.blockIds || [],
        model: params.model || this.MODEL,
        contextWindowLimit:
          params.contextWindowLimit || this.MAX_CONTEXT_WINDOW_LIMIT,
        embedding: params.embedding || this.EMBEDDING,
      });
      return lettaAgent.id;
    } else {
      throw new Error('Failed to create Letta agent: insufficient parameters');
    }
  }

  /**
   * Retrieve an agent by its name
   * @param name - The name of the agent to retrieve
   * @returns Promise<string> - The agent ID if found
   */
  public async getAgentByName(name: string): Promise<AgentState> {
    try {
      const agents = await this.lettaClient.agents.list({
        name: name,
        limit: 1, // We only need the first match
      });

      const agent = agents[0];
      if (!agent) {
        throw new Error(`No agent found with name: ${name}`);
      }

      return agent;
    } catch (error) {
      console.error(`Failed to retrieve agent with name: ${name}`, error);
      throw new Error('Failed to retrieve agent');
    }
  }

  public async deleteAgent(agentId: string) {
    try {
      await this.lettaClient.agents.delete(agentId);
      console.log(`Agent deleted: ${agentId}`);
    } catch (error) {
      console.error(`Failed to delete agent: ${agentId}`, error);
      throw new Error('Failed to delete agent');
    }
  }

  /**
   * Checks if an agent exists by ID
   * @param agentId - The ID of the agent to check
   * @returns Promise<boolean> - True if the agent exists, false otherwise
   */
  private async agentExists(agentId: string): Promise<boolean> {
    try {
      const agents = await this.lettaClient.agents.list({
        limit: 100, // Get a reasonable number of agents to check
      });

      // Check if any agent has the matching ID
      return agents.some((agent) => agent.id === agentId);
    } catch (error) {
      console.error(`Failed to check if agent exists: ${agentId}`, error);
      throw error;
    }
  }

  /**
   * Updates a specific memory block for an agent
   * @param agentId - The ID of the agent to update
   * @param label - The label of the memory block to update
   * @param value - The new value for the memory block
   * @returns Promise<void>
   */
  public async updateMemoryBlock(
    agentId: string,
    label: string,
    value: string,
  ): Promise<void> {
    try {
      // First verify the agent exists
      const exists = await this.agentExists(agentId);
      if (!exists) {
        throw new Error(`Agent not found: ${agentId}`);
      }

      try {
        await this.lettaClient.agents.blocks.modify(agentId, label, {
          value: value,
        });
      } catch (error) {
        console.error(
          `Failed to update memory block '${label}' for agent: ${agentId}`,
          error,
        );
        throw new Error(`Failed to update memory block: ${error}`);
      }

      console.log(`Memory block '${label}' updated for agent: ${agentId}`);
    } catch (error) {
      console.error(
        `Failed to update memory block '${label}' for agent: ${agentId}`,
        error,
      );
      throw new Error(`Failed to update memory block: ${error}`);
    }
  }

  /**
   * Gets a specific memory block for an agent
   * @param agentId - The ID of the agent
   * @param label - The label of the memory block to get
   * @returns Promise<string | null> - The value of the memory block, or null if not found
   */
  public async getMemoryBlock(
    agentId: string,
    label: string,
  ): Promise<string | null> {
    try {
      // First verify the agent exists
      const exists = await this.agentExists(agentId);
      if (!exists) {
        throw new Error(`Agent not found: ${agentId}`);
      }

      try {
        const block = await this.lettaClient.agents.blocks.retrieve(
          agentId,
          label,
        );
        return block.value;
      } catch (error) {
        console.log(`Memory block '${label}' not found for agent: ${agentId}`);
        return null;
      }
    } catch (error) {
      console.error(
        `Failed to get memory block '${label}' for agent: ${agentId}`,
        error,
      );
      throw new Error(`Failed to get memory block: ${error}`);
    }
  }

  public async attachTool(agentId: string, toolId: string) {
    try {
      const response = await fetch(
        `${config.letta.baseUrl}/v1/agents/${agentId}/tools/attach/${toolId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${config.letta.token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      if (!response.ok) {
        const errorResponse = await response.text();
        console.error('Attach tool response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorResponse,
        });
        try {
          const errorJson = JSON.parse(errorResponse);
          throw new Error(
            `Failed to attach tool: ${errorJson.detail || JSON.stringify(errorJson)}`,
          );
        } catch (e) {
          throw new Error(
            `Failed to attach tool: ${errorResponse || response.statusText}`,
          );
        }
      }
      return await response.json();
    } catch (error) {
      console.error(
        `Failed to attach tool ${toolId} to agent ${agentId}:`,
        error,
      );
      throw new Error('Failed to attach tool to agent');
    }
  }

  public async detachTool(agentId: string, toolId: string) {
    try {
      const response = await fetch(
        `${config.letta.baseUrl}/v1/agents/${agentId}/tools/detach/${toolId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${config.letta.token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      if (!response.ok) {
        const errorResponse = await response.text();
        console.error('Detach tool response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorResponse,
        });
        try {
          const errorJson = JSON.parse(errorResponse);
          throw new Error(
            `Failed to detach tool: ${errorJson.detail || JSON.stringify(errorJson)}`,
          );
        } catch (e) {
          throw new Error(
            `Failed to detach tool: ${errorResponse || response.statusText}`,
          );
        }
      }
      return await response.json();
    } catch (error) {
      console.error(
        `Failed to detach tool ${toolId} from agent ${agentId}:`,
        error,
      );
      throw new Error('Failed to detach tool from agent');
    }
  }
}

export const agentManager = new AgentManager();
