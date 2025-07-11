import { lettaClient } from './letta-client';
import { MessageCreate } from '@letta-ai/letta-client/api/types/MessageCreate';
import { LettaStreamingResponse } from '@letta-ai/letta-client/api/resources/agents/resources/messages/types/LettaStreamingResponse';
import { Stream } from '@letta-ai/letta-client/core';

/**
 * Adapter for handling Letta message operations
 */
export class LettaMessageAdapter {
  /**
   * Send a message to a Letta agent and get a stream response
   * @param agentId - The ID of the agent
   * @param message - The message to send
   * @returns A stream of response chunks
   */
  public async sendStreamMessage(agentId: string, message: MessageCreate) {
    return await lettaClient.agents.messages.createStream(agentId, {
      messages: [message],
    });
  }

  /**
   * Process a stream response from a Letta agent
   * @param response - The stream to process
   * @returns The complete message content
   */
  async processStream(
    response: Stream<LettaStreamingResponse>,
  ): Promise<string> {
    let agentMessageResponse = '';
    for await (const chunk of response) {
      if ('content' in chunk && typeof chunk.content === 'string') {
        agentMessageResponse += chunk.content;
      }
    }
    return agentMessageResponse;
  }
}

export const lettaMessageAdapter = new LettaMessageAdapter();
