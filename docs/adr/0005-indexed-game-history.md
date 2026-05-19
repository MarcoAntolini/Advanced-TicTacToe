# ADR 0005: Indexed game history pagination

## Status

Accepted

## Context

`/activity` history used `listHistory`, which collected every finished game globally and filtered in memory. That does not scale and duplicates the participant-index work from ADR 0003.

## Decision

Add indexes `by_playerX_finishedAt` and `by_playerO_finishedAt` on `games`. Paginate each stream for the signed-in user, merge by `finishedAt` (fallback `_creationTime`) in `convex/lib/gameHistory.ts`. Merge pick logic lives in `shared/policy/gameHistory.ts` for tests.

Dual-stream cursor JSON `{ x, o }` tracks each index paginate position.

## Consequences

**Positive:** History reads are bounded per user; no full-table scan.

**Negative:** Slightly more complex cursor than a single offset; legacy games without `finishedAt` sort by creation time.

**Follow-up:** Do not reintroduce global finished-game collects for user history.
