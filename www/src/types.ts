import { z } from "zod";

const UserMessageZod = z.object({
  role: z.literal("user"),
  content: z.string(),
  cid: z.string(),
  tid: z.string(),
  isNewChat: z.boolean().default(true),
});

export type UserMessage = z.infer<typeof UserMessageZod>;

const SystemMessageZod = z.object({
  role: z.literal("system"),
  content: z.string(),
  cid: z.string(),
  tid: z.string().default("system"),
});

export type SystemMessage = z.infer<typeof SystemMessageZod>;

const AssistantMessageZod = z.object({
  role: z.literal("assistant"),
  content: z.string(),
  type: z.string(),
  cid: z.string(),
  tid: z.string(),
});

export type AssistantMessage = z.infer<typeof AssistantMessageZod>;

export const MessageZod = z.discriminatedUnion("role", [
  SystemMessageZod,
  UserMessageZod,
  AssistantMessageZod,
]);

export type Message = z.infer<typeof MessageZod>;

export type ChatId = `cid-${string}`;

export type ThreadId = `tid-${string}`;
