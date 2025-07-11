import { lettaMessageAdapter } from './letta/letta-messages';
import { config } from '../config/index';
import * as LettaTypes from '@letta-ai/letta-client/api/types';

export enum MessageType {
  DM = 'DM',
  MENTION = 'MENTION',
  REPLY = 'REPLY',
  GENERIC = 'GENERIC',
}

const USE_SENDER_PREFIX = config.letta.useSenderPrefix;
const SURFACE_ERRORS = config.telegram.surfaceErrors;

/**
 * Sends a timer message to the Letta agent
 * @param agentId - The ID of the agent to send the message to
 * @returns Promise<string> - The agent's response
 */
export const sendTimerMessage = async (agentId: string): Promise<string> => {
  if (!agentId) {
    console.error('Error: agentId is not set');
    return SURFACE_ERRORS
      ? `Beep boop. My configuration is not set up properly. Please message me after I get fixed 👾`
      : '';
  }

  try {
    const lettaMessage = {
      role: 'user' as const,
      content:
        "[EVENT] This is an automated timed heartbeat (visible to yourself only). Use this event to check if you should send a message to the user to ask about their progress, or edit your memories, or do nothing at all. It's up to you! .",
    };

    console.log(
      `🛜 Sending message to Letta server (agent=${agentId}): ${JSON.stringify(lettaMessage)}`,
    );
    const response = await lettaMessageAdapter.sendStreamMessage(
      agentId,
      lettaMessage,
    );

    if (response) {
      const agentMessageResponse =
        await lettaMessageAdapter.processStream(response);
      return agentMessageResponse || '';
    }
    return '';
  } catch (error) {
    console.error(error);
    return SURFACE_ERRORS
      ? 'Beep boop. An error occurred while communicating with the Letta server. Please message me again later 👾'
      : '';
  }
};

/**
 * Sends a message to the Letta agent and returns the response
 * @param messagePayload - The payload of the message data
 * @param messageType - The type of message (DM, MENTION, etc.)
 * @param agentId - The ID of the agent to send the message to
 * @returns Promise<string> - The agent's response
 */
export const sendMessage = async (
  messagePayload: LettaTypes.MessageCreate,
  messageType: MessageType,
  agentId?: string,
): Promise<string> => {
  // @ts-ignore working on the old version of the letta client
  const { content: message, senderId, name } = messagePayload;

  if (!agentId) {
    console.error('Error: agentId is not set');
    return SURFACE_ERRORS
      ? `Beep boop. My configuration is not set up properly. Please message me after I get fixed 👾`
      : '';
  }

  // We include a sender receipt so that agent knows which user sent the message
  // We also include the Discord ID so that the agent can tag the user with @
  const senderNameReceipt = `${name} (id=${senderId})`;

  // If LETTA_USE_SENDER_PREFIX, then we put the receipt in the front of the message
  // If it's false, then we put the receipt in the name field (the backend must handle it)
  const lettaMessage = {
    role: 'user' as const,
    name: USE_SENDER_PREFIX ? undefined : senderNameReceipt,
    content: USE_SENDER_PREFIX
      ? messageType === MessageType.MENTION
        ? `[${senderNameReceipt} sent a message mentioning you] ${message}`
        : messageType === MessageType.REPLY
          ? `[${senderNameReceipt} replied to you] ${message}`
          : messageType === MessageType.DM
            ? `[${senderNameReceipt} sent you a direct message] ${message}`
            : `[${senderNameReceipt} sent a message to the channel] ${message}`
      : message,
  };

  try {
    console.log(
      `🛜 Sending message to Letta server (agent=${agentId}): ${JSON.stringify(lettaMessage)}`,
    );
    const response = await lettaMessageAdapter.sendStreamMessage(
      agentId,
      lettaMessage,
    );

    if (response) {
      // show typing indicator and process message if there is a stream
      // Typing indicator logic is now handled in the respective bot files
      const agentMessageResponse =
        await lettaMessageAdapter.processStream(response);
      return agentMessageResponse || '';
    }

    return '';
  } catch (error) {
    console.error(error);
    return SURFACE_ERRORS
      ? 'Beep boop. An error occurred while communicating with the Letta server. Please message me again later 👾'
      : '';
  }
};
