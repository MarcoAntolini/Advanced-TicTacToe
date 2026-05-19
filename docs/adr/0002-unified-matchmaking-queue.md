# ADR 0002: Unified matchmaking queue

## Status

Accepted

## Context

The product needs casual quick-match (realtime and async) and ranked rated matchmaking. Separate queue tables or ad-hoc “waiting player” fields would duplicate enqueue/cancel/acknowledge lifecycle, indexes, and stale-entry cleanup.

## Decision

Use one Convex table, **`matchmakingQueue`**, with a **`queueKind`** discriminator:

| `queueKind` | Enqueue identity | Pairing |
|---|---|---|
| `casual-realtime` | signed-in user or `guest_*` | FIFO (`pairCasual`) |
| `casual-async` | signed-in user or `guest_*` | FIFO (`pairCasual`) |
| `ranked-rated` | signed-in user only | Elo bands (`pairRanked`, `ratingsCompatible`) |

Shared row fields: `playerRef`, `joinedAt`, optional `matchedGameId`, optional `ratingAtJoin` (ranked only). Index: `by_kind_time` on `[queueKind, joinedAt]`.

**Lifecycle** lives in `convex/lib/matchmaking/queue.ts` (`enqueueInQueue`, `cancelInQueue`, `acknowledgeQueueMatch`, status snapshots). **Pairing strategies** live beside it: `pairCasual.ts`; ranked pairing delegates to `findRankedOpponent` in `convex/ratings/lib/matchmaking.ts`; matched games via `createMatchedGame.ts`. Policy helpers (`queueKindRequiresAuth`, `casualQueueKindFromMode`) live in `shared/policy/queueKind.ts`.

Public Convex API: **`convex/matchmaking/`** only. Clients pass `queueKind` (including `ranked-rated`); there is no separate `rankedMatchmaking` module.

## Consequences

**Positive:** One schema and lifecycle; new queue kinds add a discriminator value, policy rules, and a pairing module—not a new table.

**Negative:** Status queries aggregate per kind; ranked and casual clients must pass the correct `queueKind` (or mode default).

**Follow-up:** Do not introduce parallel queue storage; extend `QUEUE_KINDS` and pairing in `convex/lib/matchmaking/`.
