import { lettaClient } from './letta-client';
import { LettaClient } from '@letta-ai/letta-client';

/**
 * Manages Letta tools CRUD operations.
 */
class LettaToolsManager {
  private readonly lettaClient: LettaClient;

  constructor() {
    this.lettaClient = lettaClient;
  }

  /**
   * List all tools, optionally filtered by name.
   */
  public async listTools(params?: {
    name?: string;
    limit?: number;
    cursor?: string;
  }) {
    try {
      return await this.lettaClient.tools.list(params);
    } catch (error) {
      console.error('Failed to list tools:', error);
      throw error;
    }
  }

  /**
   * Create a new tool.
   */
  public async createTool(tool: any) {
    try {
      return await this.lettaClient.tools.create(tool);
    } catch (error) {
      console.error('Failed to create tool:', error);
      throw error;
    }
  }

  /**
   * Retrieve a tool by ID.
   */
  public async getToolById(toolId: string) {
    try {
      return await this.lettaClient.tools.retrieve(toolId);
    } catch (error) {
      console.error(`Failed to retrieve tool: ${toolId}`, error);
      throw error;
    }
  }

  /**
   * Update a tool by ID.
   * NOTE: The Letta SDK does not expose a direct update/patch/put method for tools as of now.
   * If/when the SDK supports it, add the method here (e.g., upsert or patch).
   */
  // public async updateTool(toolId: string, update: any) {
  //   try {
  //     // return await this.lettaClient.tools.patch(toolId, update);
  //     // or this.lettaClient.tools.put(toolId, update);
  //   } catch (error) {
  //     console.error(`Failed to update tool: ${toolId}`, error);
  //     throw error;
  //   }
  // }

  /**
   * Delete a tool by ID.
   */
  public async deleteTool(toolId: string) {
    try {
      await this.lettaClient.tools.delete(toolId);
      console.log(`Tool deleted: ${toolId}`);
    } catch (error) {
      console.error(`Failed to delete tool: ${toolId}`, error);
      throw error;
    }
  }
}

export const toolsManager = new LettaToolsManager();
