# ADR 0003: Participant identity

## Status

Accepted

## Context

Online games store occupants in `playerX` / `playerO` as either a Convex **`users`** id or a client-issued **`guest_*`** string. The same human may present both a Clerk user id and a guest id across sessions or while signed in mid-flow. Authorization, move eligibility, forfeit-on-leave, and queue `playerRef` must agree on who counts as “this player” without duplicating string-matching rules in every mutation.

## Decision

Treat **participant identity** as a pair of optional keys, resolved at mutation boundaries:

| Layer | Role |
|---|---|
| **`convex/lib/participant.ts`** | `resolveParticipant(ctx, guestId?)` → `{ userId, guestId, playerRef }`; `playerRef` is `userId ?? guestId` via `resolvePlayerRef` |
| **`shared/policy/participant.ts`** | `participantKeys`, `isParticipant`, `participantSide`, `canMoveAs`, `forfeitWinnerWhenLeaving` — pure slot matching on any held key |
| **Storage** | `playerX` / `playerO` and queue `playerRef` store the canonical ref (user id or guest id) |

Mutations accept optional `guestId`; queries/mutations build `ParticipantIdentity` `{ userId, guestId }` and use shared policy for authorization. **`isUserId`** distinguishes guest strings from user document ids where backend logic differs (e.g. ratings, profile).

Frontend hooks pass through the same identity shape the server expects.

## Consequences

**Positive:** One matching model for “am I in this game?” and “which side am I?”; guests and signed-in users share code paths.

**Negative:** Callers must pass `guestId` when unauthenticated; mismatched guest vs stored slot correctly denies access.

**Follow-up:** Do not compare `playerX`/`playerO` to only `userId` in new code—use `isParticipant` / `participantSide` or `resolveParticipant`.
