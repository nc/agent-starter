import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import worker from '../src/index';
import { SELF } from 'cloudflare:test';
import { it, expect, assert } from 'vitest';
import '../src/index';

it('sends request', async () => {
	const response = await SELF.fetch('https://example.com');
	expect(await response.text()).toMatchInlineSnapshot(`"Missing query parameter"`);
});

it(
	'sends request',
	async () => {
		const response = await SELF.fetch('https://example.com?q=hello');
		const json = await response.json();
		assert(json != null);
		expect(Object.keys(json)).toStrictEqual(['text', 'picks', 'summaries']);
	},
	60 * 1000
);
