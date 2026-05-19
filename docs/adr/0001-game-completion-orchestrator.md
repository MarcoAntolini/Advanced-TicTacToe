# ADR 0001: Game completion orchestrator

## Status

Accepted

## Context

Games can finish through several paths: a winning or drawing move (`playMove`), forfeit, ranked clock expiry, async inactivity timeout, or abandoning an active realtime game to join another. Each path must set `status: "finished"`, persist the final board state and clocks, and run the same downstream work (player stats, optional Elo).

Duplicating finish logic across mutations and clock helpers risks inconsistent patches, double-counted stats, or ratings applied when classification does not warrant it.

## Decision

All finish paths call a single orchestrator in `convex/lib/endGame.ts`:

- **`endGame`** — idempotent: if the game is already `finished`, return `{ alreadyFinished: true }` without re-running side effects.
- **`endGameById`** — loads the game document then delegates to `endGame`.
- **`buildFinishedGamePatch`** (`convex/lib/finishGame.ts`) — builds the document patch (winner, `finishedAt`, serialized state).
- **`finishSideEffects`** (`convex/lib/finishSideEffects.ts`) — stats then ratings; ratings respect `shouldApplyRating` via classification.

Callers may pass an **`extraPatch`** (e.g. clock fields, updated `state`) merged into the finish patch. New finish reasons must use `endGame` / `endGameById`, not patch `status: "finished"` directly.

## Consequences

**Positive:** One place to audit finish behavior; idempotency avoids duplicate stats/Elo on retries or races.

**Negative:** Callers must gather outcome and any pre-finish state before calling; clock/move handlers stay responsible for computing the winner.

**Follow-up:** When adding a new terminal transition, grep for `endGame` callers (`playMove`, `forfeit`, `clock/lib/enforce`, `joinWaitingGame`) and extend the same pattern.
