# ADR 0004: Game classification

## Status

Accepted

## Context

“Ranked” is not a single mode: practice games use Fischer clocks without Elo; rated ranked games also update ratings. The database stores two optional booleans (`isRanked`, `rated`) on `games`, but product logic, UI copy, and side effects need a single semantic label.

## Decision

Define three **classifications** derived at boundaries via **`classifyGame`** in `shared/policy/gameClassification.ts`:

| Classification | `isRanked` | `rated` | Clock | Elo |
|---|---|---|---|---|
| **casual** | false / unset | false / unset | optional / mode default | no |
| **ranked-practice** | true | false / unset | Fischer | no |
| **ranked-rated** | true | true | Fischer | yes |

**Set classification at create/enqueue boundaries**, not ad hoc in finish paths:

- Waiting-room / practice create → `createFieldsForPracticeRanked`
- Ranked queue match → `createFieldsForRatedRanked`
- Rematch → `rematchClassificationFields` from source game

**Consume** via helpers: `shouldApplyRating`, `isRatedClassification`, display policy. `finishSideEffects` / `applyRatingResult` gate Elo on `shouldApplyRating`; stats apply to all finished online games as today.

## Consequences

**Positive:** One function maps storage → behavior; rematch and UI can share the same triple without re-deriving rules.

**Negative:** Legacy rows with partial flags rely on `classifyGame` rules (`isRanked !== true` → casual).

**Follow-up:** New ranked variants extend `GameClassification` and create helpers together—do not set `isRanked`/`rated` inline without going through classification helpers.
