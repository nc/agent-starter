import { uuidv7 } from 'uuidv7';

export type SearchResult = {
	id: string;
	name: string;
	url: string;
	datePublished: string;
	datePublishedDisplayText: string;
	isFamilyFriendly: boolean;
	displayUrl: string;
	dateLastCrawled: string;
	cachedPageUrl: string;
	language: string;
	isNavigational: boolean;
	noCache: boolean;
	html: string | null;
	text: string;
	summary: string | null;
};

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	querylog: KVNamespace;
	log: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	store: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;

	OPENAI_API_KEY: string;
}

import { UserMessageZod } from './Message';
import { ExampleAgent } from './ExampleAgent';

const API_KEYS: Record<string, string> = {
	overwatch: '5f0c7127-3be9-4488-b801-c7b6415b45e9',
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const MockWebSocket = { send: () => {} } as unknown as WebSocket;
		const url = new URL(request.url);
		let agent: ExampleAgent;
		let user;
		switch (url.pathname) {
			case '/api':
				const apiKey = request.headers.get('X-API-Key');
				const isValidKey = apiKey && Object.values(API_KEYS).includes(apiKey);
				if (apiKey && isValidKey) {
					for (const [_user, _key] of Object.entries(API_KEYS)) {
						if (_key === apiKey) {
							user = _user;
						}
					}
					console.log('[root] api request', request.url);
				} else {
					return new Response('X-API-Key missing or invalid', { status: 400 });
				}
			// fallthrough to '/' handler
			case '/':
				const q = url.searchParams.get('q');
				const cid = url.searchParams.get('cid') || `cid-${uuidv7()}`;
				agent = new ExampleAgent(env, cid, MockWebSocket);
				if (q === null) return new Response('Missing query parameter', { status: 400 });
				const answer = await agent.process(env, {
					cid,
					tid: 'any',
					role: 'user',
					content: q,
					isNewChat: true,
				});
				return new Response(JSON.stringify(answer), {
					headers: {
						'Content-Type': 'application/json',
					},
				});
			case '/ws':
				console.log('[root] ws');
				const upgradeHeader = request.headers.get('Upgrade');
				if (!upgradeHeader || upgradeHeader !== 'websocket') {
					return new Response('Expected Upgrade: websocket', { status: 426 });
				}
				const webSocketPair = new WebSocketPair();
				const _ = webSocketPair[0],
					server = webSocketPair[1];
				server.accept();
				server.addEventListener('message', async (event) => {
					try {
						if (event.data instanceof ArrayBuffer) return;
						console.log('[root] event.data', event.data);
						const userMessage = UserMessageZod.parse(JSON.parse(event.data));
						console.log('[root] userMessage', userMessage);
						const agent = new ExampleAgent(env, userMessage.cid, server);
						try {
							await agent.process(env, { ...userMessage });
							console.log('[root] processed message');
						} catch (e) {
							console.error('[root] failed to process', userMessage, e);
						}
					} catch (e) {
						console.error('[root] message f', e);
					}
				});

				return new Response(null, {
					status: 101,
					webSocket: _,
				});
		}
		return new Response('Not found', { status: 404 });
	},
};
