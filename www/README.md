# AI Agent Starter React + TypeScript + Vite + Cloudflare Worker

This template provides a minimal setup to get a basic AI Agent setup with streaming events over websockets and the ability to compose multiple AI 'programs' together in a workflow.

There are two subdirectories:
`server` Cloudflare worker
`www` React working in Vite with HMR and some ESLint rules.

## Setup

In wrangler.toml set your OPENAI_API_KEY

then run `heroku local` in the project root.
