import OpenAI from 'openai';
import { config } from '../config/index';
import { ApiCache } from '../utils/api-cache';

// Initialize the OpenAI client
const client = new OpenAI({
  apiKey: config.openai.apiKey,
});

// Initialize cache
const cache = ApiCache.getInstance('openai');

export const openaiService = {
  /**
   * Generate a cache key for a chat completion request
   * @param params - Chat completion parameters
   * @returns A cache key string
   */
  generateCacheKey: (
    params: OpenAI.Chat.ChatCompletionCreateParams,
  ): string => {
    const { messages, model } = params;
    // Only use the last message and model for the key
    const lastMessage = messages[messages.length - 1];
    const key = `${model}:${lastMessage.role}:${lastMessage.content}`;
    return ApiCache.hashKey(key);
  },

  /**
   * Call the OpenAI API to generate a chat completion
   * @param params - Chat completion parameters
   * @returns The API response
   */
  createChatCompletion: async (
    params: OpenAI.Chat.ChatCompletionCreateParams,
  ): Promise<OpenAI.Chat.ChatCompletion> => {
    try {
      // Check cache
      const cacheKey = openaiService.generateCacheKey(params);
      const cachedResponse = cache.get(cacheKey);

      if (cachedResponse) {
        return cachedResponse;
      }

      // Call the API with explicit non-streaming
      const response = await client.chat.completions.create({
        ...params,
        stream: false,
      });

      // Cache the response
      cache.set(cacheKey, response);

      return response;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error(
        `Failed to generate chat completion: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  },

  /**
   * Helper to create a simple text completion with a single user prompt
   * @param prompt - The user's prompt text
   * @param model - The model to use
   * @param options - Optional parameters
   * @returns The text response
   */
  createTextCompletion: async (
    prompt: string,
    model = 'gpt-4o-mini',
    options: Omit<
      OpenAI.Chat.ChatCompletionCreateParams,
      'messages' | 'model' | 'response_format'
    > = {},
  ): Promise<string> => {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'user', content: prompt },
    ];

    const response = await openaiService.createChatCompletion({
      messages,
      model,
      ...options,
    });

    return response.choices?.[0]?.message?.content ?? '';
  },

  /**
   * Helper to create a JSON completion with a single user prompt
   * @param prompt - The user's prompt text
   * @param model - The model to use
   * @param options - Optional parameters
   * @returns The parsed JSON response
   */
  createJsonCompletion: async <T>(
    prompt: string,
    model = 'gpt-4o-mini',
    options: Omit<
      OpenAI.Chat.ChatCompletionCreateParams,
      'messages' | 'model' | 'response_format'
    > = {},
  ): Promise<T> => {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'user', content: prompt },
    ];

    const response = await openaiService.createChatCompletion({
      messages,
      model,
      response_format: { type: 'json_object' },
      ...options,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    try {
      return JSON.parse(content) as T;
    } catch (error) {
      throw new Error(
        `Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  },
};
