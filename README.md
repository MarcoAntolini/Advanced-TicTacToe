# Advanced TicTacToe

Ultimate Tic-Tac-Toe built with **Next.js 15**, **Convex**, and optional **Clerk** auth.

## Features

- **Local** pass-and-play
- **Realtime** online (invite code + quick match)
- **Async** turns (72h timeout per turn)
- Optional accounts: profile, stats, game history

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Start Convex (creates deployment + `NEXT_PUBLIC_CONVEX_URL`):

```bash
npx convex dev
```

4. Configure [Clerk + Convex](https://docs.convex.dev/auth/clerk) and set keys in `.env.local`.

5. Run the app:

```bash
npm run all
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run convex` | Convex backend |
| `npm run all` | Both in parallel |
| `npm test` | Vitest (game engine) |
| `npm run test:e2e` | Playwright E2E |

## Project structure

- `shared/game/` — Ultimate TTT rules engine (used by UI + Convex)
- `convex/` — Schema, queries, mutations, matchmaking
- `src/app/` — App Router pages
- `src/components/game/` — Board UI
- `design-system/MASTER.md` — UI tokens reference
