import { Env } from '.';
import { Client } from './ClientResponse';
import { UserMessage } from './Message';
import { Agent, streamGen } from './Agent';

export class ExampleAgent extends Agent {
	async *answer(env: Env, starter: string) {
		let systemMessage = `You are a smart writer capable of taking a simple english starter and writing a short story based on it. At most 100 words. \n\n`;
		systemMessage += `\n\nYour conversations BEGINS!`;

		const stream = streamGen(
			env,
			[
				{
					role: 'system',
					content: systemMessage,
				},
				{
					role: 'user',
					content: `Starter: ${starter}`,
				},
			],
			Agent.MODELS.pro
		);
		let answer = '';
		for await (const token of stream) {
			yield token;
		}
		return answer;
	}

	async process(env: Env, userMessage: UserMessage) {
		let starter = userMessage.content!;
		const client = new Client(this.cid, userMessage.tid, this.ws);

		console.log('[process] writing', `'${starter}'`);

		let answer = '';
		for await (const token of this.answer(env, starter)) {
			answer += token;
			client.sendAnswerToken(token);
		}
		client.sendAnswer(answer);
	}
}
