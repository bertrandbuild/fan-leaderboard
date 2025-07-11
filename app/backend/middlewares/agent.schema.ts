import z from 'zod';

export const agentDetailsSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  systemPrompt: z.string().min(1),
  persona: z.string().optional(),
  model: z.string().min(1),
});

export const agentCreateSchema = z.object({
  version: z.number().int().min(1),
  details: agentDetailsSchema,
  status: z.enum(['enabled', 'disabled', 'pending', 'error']),
});

export const agentSchema = z.object({
  ...agentCreateSchema.shape,
  id: z.string(),
});

export type AgentInput = z.infer<typeof agentCreateSchema>;
