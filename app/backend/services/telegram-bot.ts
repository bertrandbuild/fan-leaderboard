import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';
import { config } from '../config/index';
import { agentService } from './agent';
import {
  sendMessage,
  sendTimerMessage,
  MessageType,
} from './message-service';
import { openaiService } from './openai';
import { agentShouldAnswerPromptTemplate, parseTemplate } from '../data/prompts';
import * as LettaTypes from '@letta-ai/letta-client/api/types';

// Define the expected JSON structure from the LLM
interface ShouldAnswerResponse {
  answer: 'yes' | 'no';
  reason: string;
}

export class TelegramBot {
  private bot: Telegraf<Context>;
  private mainAgentId: string = '';
  private messageHistory: Map<string, Array<{ text: string; sender: string }>> =
    new Map(); // chatId -> message history with sender info
  private startTime: number = Math.floor(Date.now() / 1000); // UNIX timestamp in seconds
  private running = false;

  constructor() {
    if (!config.telegram || !config.telegram.botId) {
      throw new Error(
        'Telegram bot token is not configured. Please check your configuration file.',
      );
    }
    this.bot = new Telegraf(config.telegram.botId);

    // Set up event handlers
    this.setupEventHandlers();
  }

  public async start(mainAgentId?: string) {
    if (mainAgentId) {
      this.mainAgentId = mainAgentId;
    }
    if (!this.mainAgentId) {
      throw new Error('mainAgentId is not set');
    }
    await this.initialize(this.mainAgentId);
    this.running = true;
  }

  /**
   * Initialize the Telegram bot
   */
  public async initialize(mainAgentId: string): Promise<void> {
    this.mainAgentId = mainAgentId;
    // Launch the bot
    this.bot.launch();
    this.startTime = Math.floor(Date.now() / 1000);
    console.log('🤖 Telegram bot started');

    // Enable graceful stop
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }

  /**
   * Set up all Telegram event handlers
   */
  private setupEventHandlers(): void {
    // Handle /start command for DMs (equivalent to starting a coaching session)
    this.bot.command('start', this.handleStartCommand.bind(this));

    // Handle incoming text messages
    this.bot.on(message('text'), this.handleTextMessage.bind(this));
    console.log('🤖 Telegram bot setup complete');

    // TODO: Add more handlers as needed (e.g., for other commands, different message types)
  }

  /**
   * Handle the /start command (typically in DMs)
   */
  private async handleStartCommand(ctx: Context): Promise<void> {
    if (ctx.chat && ctx.chat.type === 'private' && ctx.from) {
      console.log(
        `📩 Received /start command from ${ctx.from.username} (ID: ${ctx.from.id})`,
      );
      // Treat this as starting a new coaching session, similar to a DM in Discord
      await this.processAndSendMessage(ctx, MessageType.DM);
    } else {
      // Potentially ignore /start command in group chats or provide a different response
      console.log(
        '📩 Received /start command in non-private chat or without user info, ignoring for now.',
      );
    }
  }

  /**
   * Add a message to the history for a specific chat
   */
  private addMessageToHistory(
    chatId: string,
    message: string,
    senderId: string,
  ): void {
    if (!this.messageHistory.has(chatId)) {
      this.messageHistory.set(chatId, []);
    }
    const history = this.messageHistory.get(chatId)!;

    // Determine if the sender is the bot
    const sender =
      config.telegram.botId && senderId === config.telegram.botId
        ? '(You)'
        : `User_${senderId}`;

    history.push({ text: message, sender });
    // Keep only the last 10 messages
    if (history.length > 10) {
      history.shift();
    }
  }

  /**
   * Get recent messages for a specific chat
   */
  private getRecentMessages(chatId: string, limit: number = 3): string[] {
    const history = this.messageHistory.get(chatId) || [];
    return history.slice(-limit).map((msg) => `${msg.sender}: ${msg.text}`);
  }

  /**
   * Handle incoming text messages
   */
  private async handleTextMessage(ctx: Context): Promise<void> {
    console.log(
      `📩 Received message from ${ctx.from?.username}: ${ctx.message?.chat.id}`,
    );

    // Ensure 'message' and 'text' properties exist
    if (!ctx.message || !('text' in ctx.message) || !ctx.from) {
      console.log('📩 Ignoring message without text or sender info.');
      return;
    }

    const messageText = ctx.message.text;
    const userId = ctx.from.id;
    const username = ctx.from.username || `User_${userId}`;

    // Ignore messages from before the bot was started
    if (ctx.message.date < this.startTime) {
      console.log('Ignoring old message:', ctx.message.text);
      return;
    }

    // If it's a /start command, let handleStartCommand deal with it.
    if (messageText.trim().toLowerCase() === '/start') {
      console.log('📩 Text message is /start, deferring to command handler.');
      return;
    }

    // Ignore messages from the bot itself (if config.telegram.botId is set)
    if (config.telegram.botId && userId.toString() === config.telegram.botId) {
      console.log(`📩 Ignoring message from myself...`);
      return;
    }

    // Handle test commands
    if (messageText.trim().toLowerCase() === '!testprogram') {
      console.log(`📩 Received test program command from ${username}`);
      // You might want to send a reply for test commands
      // await ctx.reply("Test program command received!");
      return;
    }

    // Ignore messages that start with ! (unless it's a command you want to handle)
    if (
      messageText.startsWith('!') &&
      messageText.trim().toLowerCase() !== '!testprogram'
    ) {
      console.log(`📩 Ignoring message that starts with ! from ${username}...`);
      return;
    }

    // Handle Direct Messages (private chats)
    if (ctx.chat && ctx.chat.type === 'private') {
      await this.handleDirectMessage(ctx);
      return;
    }

    // Handle mentions (in group chats)
    // Telegraf's `ctx.message.entities` can be used to detect mentions.
    // A message entity of type 'mention' for the bot's username indicates a mention.
    // Or, if the message is a reply to the bot's message.
    const botUsername = (await ctx.telegram.getMe()).username;
    const isMentioned =
      ctx.message.entities?.some(
        (entity: { type: string; offset: number; length: number }) =>
          entity.type === 'mention' &&
          messageText.substring(
            entity.offset,
            entity.offset + entity.length,
          ) === `@${botUsername}`,
      ) ||
      (ctx.message.reply_to_message &&
        ctx.message.reply_to_message.from?.username === botUsername);

    // BYPASS: Always respond if mentioned or reply to bot
    if (
      (config.telegram.respondToMentions && isMentioned) ||
      (ctx.message.reply_to_message &&
        ctx.message.reply_to_message.from?.username === botUsername)
    ) {
      await this.handleMentionOrReply(ctx);
      return;
    }

    // Handle generic messages in groups (if the bot is part of the group and configured to respond)
    // This would typically be for groups where the bot is explicitly added and configured to listen.
    if (config.telegram.respondToGeneric && ctx.chat) {
      console.log(`🤖 Handling generic message in group ${ctx.chat.id}`);
      // If LLM should decide, call shouldAnswer
      if (config.telegram.llmDecidesGroupResponse) {
        // Add current message to history
        if (ctx.message && 'text' in ctx.message && ctx.from) {
          this.addMessageToHistory(
            ctx.chat.id.toString(),
            ctx.message.text,
            ctx.from.id.toString(),
          );
        }

        // Get recent messages
        const messageHistory = this.getRecentMessages(
          ctx.chat.id.toString(),
          3,
        );

        console.log(`🤖 Message history: ${messageHistory}`);
        const decision = await this.shouldAnswer(
          ctx.message.text,
          messageHistory.reverse(),
        );
        if (decision.answer === 'yes') {
          console.log(`🤖 LLM says YES to responding: ${decision.reason}`);
          // Small delay to avoid rate limiting 0.5 seconds
          await new Promise((resolve) => setTimeout(resolve, 500));
          await this.handleGenericMessage(ctx);
        } else {
          console.log(`🤖 LLM says NO to responding: ${decision.reason}`);
        }
        return;
      } else {
        // Fallback to original generic message handling if LLM decision is disabled
        await this.handleGenericMessage(ctx);
        return;
      }
    }

    console.log(
      `📩 Received message from ${username} in chat ${ctx.chat?.id}, but no specific handler matched.`,
    );
  }

  /**
   * Handle direct messages (private chats)
   */
  private async handleDirectMessage(ctx: Context): Promise<void> {
    if (!ctx.message || !('text' in ctx.message) || !ctx.from) return;
    console.log(
      `📩 Received DM from ${ctx.from.username}: ${ctx.message.text}`,
    );
    if (config.telegram.respondToDms) {
      await this.processAndSendMessage(ctx, MessageType.DM);
    } else {
      console.log(`📩 Ignoring DM...`);
      await ctx.reply(
        "I'm not configured to respond to direct messages currently.",
      );
    }
  }

  /**
   * Handle mentions and replies in group chats
   */
  private async handleMentionOrReply(ctx: Context): Promise<void> {
    if (!ctx.message || !('text' in ctx.message) || !ctx.from) return;
    console.log(
      `📩 Received mention/reply from ${ctx.from.username}: ${ctx.message.text}`,
    );

    // Telegraf doesn't have a direct sendTyping equivalent that works universally like Discord.js.
    // We can use `ctx.telegram.sendChatAction(ctx.chat.id, 'typing')`
    if (ctx.chat) {
      try {
        await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
      } catch (error) {
        console.log('Could not send typing indicator:', error);
      }
    }

    // If it's a reply to the bot, the original message is in ctx.message.reply_to_message
    // For mentions, there isn't a direct "original message" in the same way unless it's also a reply.
    // We will adapt the sendMessage to accept Context and extract necessary info.
    const messageType = ctx.message.reply_to_message
      ? MessageType.REPLY
      : MessageType.MENTION;

    // Construct MessagePayload from Telegraf context
    if (!ctx.message || !('text' in ctx.message) || !ctx.from || !ctx.chat)
      return;
    const payload: LettaTypes.MessageCreate = {
      content: ctx.message.text,
      role: 'user',
      name: ctx.from.username || `User_${ctx.from.id}`,
      // channelId: ctx.chat.id.toString() // Not strictly needed by sendMessage now
    };
    const responseText = await sendMessage(
      payload,
      messageType,
      this.mainAgentId,
    );

    if (responseText !== '') {
      await ctx.reply(responseText);
    }
  }

  /**
   * Handle generic messages in configured group chats
   */
  private async handleGenericMessage(ctx: Context): Promise<void> {
    if (!ctx.message || !('text' in ctx.message) || !ctx.from) return;
    console.log(
      `📩 Received generic group message from ${ctx.from.username}: ${ctx.message.text}`,
    );
    await this.processAndSendMessage(ctx, MessageType.GENERIC);
  }

  /**
   * Process a message and send a response
   */
  private async processAndSendMessage(
    ctx: Context,
    messageType: MessageType,
    existingAgentId?: string,
  ): Promise<void> {
    if (!ctx.from || !ctx.chat) {
      console.error('🛑 Error: Missing user or chat information in context.');
      await ctx.reply(
        '❌ Sorry, I could not identify you or the chat. Please try again.',
      );
      return;
    }

    try {
      let agentId = existingAgentId || this.mainAgentId;

      // Construct MessagePayload from Telegraf context
      if (!ctx.message || !('text' in ctx.message) || !ctx.from || !ctx.chat) {
        console.error(
          '🛑 Error: Missing critical message, user, or chat information in context for processAndSendMessage.',
        );
        return;
      }
      const payload: LettaTypes.MessageCreate = {
        content: ctx.message.text,
        role: 'user',
        name: ctx.from.username || `User_${ctx.from.id}`,
      };
      const responseText = await sendMessage(payload, messageType, agentId);

      if (responseText !== '') {
        await ctx.reply(responseText);
        // Add bot's response to message history
        if (config.telegram.botId) {
          this.addMessageToHistory(
            ctx.chat.id.toString(),
            responseText,
            config.telegram.botId,
          );
        }
        console.log(`Message sent: ${responseText}`);
      }
    } catch (error: any) {
      console.error('🛑 Error Details for Telegram Bot:');
      console.error(
        '  Type:',
        error.constructor ? error.constructor.name : 'Unknown',
      );
      console.error('  Message:', error.message || 'No error message');
      if (error.response && error.response.description) {
        console.error('  Telegram Error:', error.response.description);
      }

      const errorMessage =
        '❌ Sorry, I encountered an error processing your request. Please try again later.';
      try {
        await ctx.reply(errorMessage);
        // Add error message to history as well
        if (config.telegram.botId && ctx.chat) {
          this.addMessageToHistory(
            ctx.chat.id.toString(),
            errorMessage,
            config.telegram.botId,
          );
        }
      } catch (replyError) {
        console.error('🛑 Failed to send error message to user:', replyError);
      }
    }
  }

  private async shouldAnswer(
    currentMessageText: string,
    history: string[],
  ): Promise<ShouldAnswerResponse> {
    const promptValues = {
      current_message: currentMessageText,
      history_message_1: history[0] || '',
      history_message_2: history[1] || '',
      history_message_3: history[2] || '',
    };

    const filledPrompt = parseTemplate(
      agentShouldAnswerPromptTemplate,
      promptValues,
    );

    try {
      console.log('🤖 Asking LLM if P33ly should answer...');
      const response =
        await openaiService.createJsonCompletion<ShouldAnswerResponse>(
          filledPrompt,
          // config.openai.model, // Or your preferred model for this task
          // You might want to use a faster/cheaper model for this if available
        );
      console.log(
        `🤖 LLM decision: ${response.answer}, Reason: ${response.reason}`,
      );
      return response;
    } catch (error) {
      console.error('Error getting LLM decision for shouldAnswer:', error);
      return { answer: 'no', reason: 'Error in LLM decision process.' }; // Default to no on error
    }
  }

  public isRunning() {
    return this.running;
  }

  public stop() {
    this.bot.stop();
    this.running = false;
    console.log('🤖 Telegram bot stopped');
  }
}

// Export an instance of the bot
export const telegramBot = new TelegramBot();