/** Minimum completed ranked games to appear on the public leaderboard. */
export const LEADERBOARD_MIN_GAMES = 5;

/** Initial Elo band when searching for a ranked opponent. */
export const MATCHMAKING_INITIAL_BAND = 200;

/** Widen the band by this many Elo points each step. */
export const MATCHMAKING_BAND_STEP = 50;

/** Milliseconds between band widen steps while in queue. */
export const MATCHMAKING_BAND_STEP_MS = 10_000;

/**
 * Default season when the `seasons` table has no active row (bootstrap / fallback).
 * Runtime season comes from `seasons` via `getActiveSeason()` in Convex.
 */
export const CURRENT_SEASON_ID = 1;

export const CURRENT_SEASON_LABEL = "Season 1";
