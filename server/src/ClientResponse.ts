export class Client {
	ws: WebSocket;
	cid: string;
	tid: string;

	constructor(cid: string, tid: string, ws: WebSocket) {
		this.ws = ws;
		this.cid = cid;
		this.tid = tid;
	}

	async sendAnswerToken(answerToken: string) {
		this.ws.send(
			JSON.stringify({
				cid: this.cid,
				tid: this.tid,
				role: 'assistant',
				content: answerToken,
				type: 'answerToken',
			})
		);
	}

	async sendAnswer(answer: string) {
		const message = {
			cid: this.cid,
			tid: this.tid,
			role: 'assistant',
			content: answer,
			type: 'answer',
		};
		this.ws.send(JSON.stringify(message));
	}
}
