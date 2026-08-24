# my-ai

A small, self-contained **AI assistant web app**. It has a modern React (Vite +
TypeScript) frontend and an Express + TypeScript backend. The "AI" is a tiny
deterministic engine that runs entirely locally — **no external API keys or
network access required** — which makes it trivial to run in any development
environment.

## Features

- 💬 Chat UI with suggestions, typing indicator, and live backend health status
- 🧮 Arithmetic (`what is 24 * (3 + 5)?`)
- 📊 Text stats (`count words in the quick brown fox`)
- 🔁 Text transforms (`reverse hello world`, `uppercase ...`)
- 🔎 Palindrome detection and basic sentiment analysis
- 🕒 Date/time and jokes

## Tech stack

| Layer    | Tech                                   |
| -------- | -------------------------------------- |
| Frontend | React 18, Vite 5, TypeScript           |
| Backend  | Node.js, Express 4, TypeScript (`tsx`) |
| Shared   | Pure-TS AI engine in `shared/ai.ts`    |

## Getting started

Requires Node.js >= 20.

```bash
npm install        # install dependencies
npm run dev        # start backend (:3001) + frontend (:5173) together
```

Then open http://localhost:5173. The Vite dev server proxies `/api/*` to the
Express backend automatically.

### Production build

```bash
npm run build      # bundle the client into dist/client
npm start          # serve the API + built client on :3001 (single origin)
```

## Scripts

| Command             | Description                                        |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Run backend and frontend together (hot reload)     |
| `npm run build`     | Build the client for production                     |
| `npm start`         | Run the production server (serves API + built app)  |
| `npm test`          | Run the AI engine unit tests                        |
| `npm run typecheck` | Type-check the client and server projects           |

## API

| Method | Endpoint            | Description                          |
| ------ | ------------------- | ------------------------------------ |
| `GET`  | `/api/health`       | Health/uptime check                  |
| `GET`  | `/api/capabilities` | List of example prompts              |
| `POST` | `/api/chat`         | `{ "message": "..." }` → AI reply    |

## Project layout

```
.
├── index.html            # Vite entry HTML
├── src/                  # React frontend
│   ├── main.tsx
│   ├── App.tsx
│   └── index.css
├── server/               # Express backend
│   └── index.ts
├── shared/               # Shared, framework-agnostic AI engine
│   └── ai.ts
├── test/                 # Node test-runner unit tests
│   └── ai.test.ts
└── .cursor/environment.json
```
