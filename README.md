# AI Agent Starter

## React + TypeScript + Vite + Cloudflare Worker

This template provides a minimal setup to get a basic AI Agent setup with streaming events over websockets and the ability to compose multiple AI 'programs' together in a workflow.

There are two subdirectories:
`server` Cloudflare worker
`www` React working in Vite with HMR and some ESLint rules.

## Setup

### Set your Open AI API Key

In ` wrangler.toml`` set your  `OPENAI_API_KEY``

### Install node deps

`cd server && npm i`
`cd www && npm i`

### Start local dev servers

Then run `heroku local` in the project root.
You'll need the heroku command line tool to do this.

If you don't have heroku installed you can also run the dev servers by
`cd server && npm run dev`
`cd www && npm run dev`

Heroku is not required for deploying this project, you'll need to use
Cloudflare Workers for the server and ideally Cloudflare Pages for the web app.
