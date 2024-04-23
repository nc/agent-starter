import OpenAI from 'openai';
import { Env } from '.';
import { Message } from './Message';

import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

export async function gen(
	env: Env,
	messages: ChatCompletionMessageParam[],
	model = Agent.DEFAULT_MODEL,
	response_format: { type: 'text' | 'json_object' } = { type: 'text' }
) {
	const openai = new OpenAI({
		apiKey: env.OPENAI_API_KEY,
	});
	console.log(messages.map((m) => ({ role: m.role, content: m.content })) as ChatCompletionMessageParam[]);
	const completion = await openai.chat.completions.create({
		messages: messages.map((m) => ({ role: m.role, content: m.content })) as ChatCompletionMessageParam[],
		model,
		temperature: 0.1,
		response_format,
	});
	return completion.choices[0].message.content!;
}

export async function* streamGen(
	env: Env,
	messages: ChatCompletionMessageParam[],
	model = Agent.DEFAULT_MODEL,
	response_format: {
		type: 'text' | 'json_object';
	} = {
		type: 'text',
	}
) {
	const openai = new OpenAI({
		apiKey: env.OPENAI_API_KEY,
	});
	console.log(messages.map((m) => ({ role: m.role, content: m.content })) as ChatCompletionMessageParam[]);
	const stream = await openai.chat.completions.create({
		messages: messages.map((m) => ({ role: m.role, content: m.content })) as ChatCompletionMessageParam[],
		model,
		temperature: 0.1,
		response_format,
		stream: true,
	});
	let completion = '';
	for await (const chunk of stream) {
		const token = chunk.choices[0].delta.content;
		completion += token;
		if (token) yield token;
	}
}

export class Agent {
	static DEFAULT_MODEL = 'gpt-4-turbo';
	static MODELS = {
		pro: 'gpt-4-turbo',
		fast: 'gpt-3.5-turbo',
	};
	openai: OpenAI;
	history: Message[] = [];
	cid: string;
	env: Env;
	ws: WebSocket;

	constructor(env: Env, cid: string, ws: WebSocket) {
		this.openai = new OpenAI({
			apiKey: env.OPENAI_API_KEY,
		});
		this.env = env;
		this.cid = cid;
		this.ws = ws;
	}

	protected async get(url: string) {
		const response = await fetch(url);
		if (response.status !== 200) {
			return null;
		}
		return response.text();
	}
}
