import { z } from 'zod';

export const SystemMesageZod = z.object({
	role: z.literal('system'),
	content: z.string(),
	cid: z.string(),
	tid: z.string().default('system'),
});

export const UserMessageZod = z.object({
	role: z.literal('user'),
	content: z.string(),
	cid: z.string(),
	tid: z.string(),
	isNewChat: z.boolean().default(true),
});

export const AssistantMessageZod = z.object({
	role: z.literal('assistant'),
	content: z.string(),
	cid: z.string(),
	tid: z.string(),
});

export type SystemMessage = z.infer<typeof SystemMesageZod>;
export type UserMessage = z.infer<typeof UserMessageZod>;
export type AssistantMessage = z.infer<typeof AssistantMessageZod>;

export const MessageZod = z.discriminatedUnion('role', [SystemMesageZod, UserMessageZod, AssistantMessageZod]);

export type Message = z.infer<typeof MessageZod>;
