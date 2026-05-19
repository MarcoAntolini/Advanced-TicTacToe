# Domain glossary

Terms used across backend, frontend, and architecture reviews.

## Architecture decisions

Recorded decisions (context, choice, consequences) live in [`docs/adr/`](docs/adr/):

| ADR | Topic |
|---|---|
| [0001](docs/adr/0001-game-completion-orchestrator.md) | Single `endGame` orchestrator for all finish paths |
| [0002](docs/adr/0002-unified-matchmaking-queue.md) | One `matchmakingQueue` table with `queueKind` discriminator |
| [0003](docs/adr/0003-participant-identity.md) | Participant keys, `resolveParticipant`, shared policy |
| [0004](docs/adr/0004-game-classification.md) | Casual / ranked-practice / ranked-rated; `classifyGame` at boundaries |
| [0005](docs/adr/0005-indexed-game-history.md) | Indexed dual-stream pagination for `/activity` history |

## Game modes

- **Local** — pass-and-play on one device; no Convex sync.
- **Realtime** — online play with live turns; one active realtime game per player.
- **Async** — online play with long turn windows (72h timeout).

## Waiting room

A **waiting room** is a game document with `status: "waiting"` and at least one open player slot. Players join via **public lobby** or **invite code**.

## Game classification

How ranked rules and Elo apply:

| Classification | `isRanked` | `rated` | Meaning |
|---|---|---|---|
| **Casual** | false / unset | false / unset | Normal online rules |
| **Ranked practice** | true | false | Fischer clock, no Elo |
| **Ranked rated** | true | true | Fischer clock + Elo |

Create paths: practice rooms set ranked-practice; ranked queue sets ranked-rated. **Rematch** preserves classification from the source game.

## Participant

A **participant** is whoever occupies `playerX` or `playerO` — a signed-in user id or a guest id (`guest_*`). Authorization matches any identity key the client holds (user id and/or guest id).

## Matchmaking queue

One **`matchmakingQueue`** table stores all pairing waits. Rows are keyed by **`queueKind`**:

| `queueKind` | Who may enqueue | Pairing |
|---|---|---|
| `casual-realtime` | user or guest | FIFO |
| `casual-async` | user or guest | FIFO |
| `ranked-rated` | signed-in user only | Elo bands (`ratingsCompatible`) |

Shared fields: `playerRef`, `joinedAt`, optional `matchedGameId`, optional `ratingAtJoin` (ranked only).

When matched, the waiter receives **`matchedGameId`** on their queue row; the joiner gets `gameId` from the enqueue response. Pairing strategies live in `convex/lib/matchmaking/` (`pairCasual`, rated bands via `findRankedOpponent`); lifecycle in `queue.ts`. **Public API:** `api.matchmaking.*` with `queueKind` — no separate ranked module.

## Game history

Signed-in **activity** history paginates finished games via `by_playerX_finishedAt` / `by_playerO_finishedAt` indexes (see ADR 0005). Never scan all finished games globally.

## Game completion

A game **ends** when the document moves to `status: "finished"` and side effects run (stats, optional Elo). All finish paths go through the **`endGame`** orchestrator.
