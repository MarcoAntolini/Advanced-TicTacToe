import {
	MATCHMAKING_BAND_STEP,
	MATCHMAKING_BAND_STEP_MS,
	MATCHMAKING_INITIAL_BAND,
} from "./constants";

export function matchmakingBandMs(joinedAt: number, now: number): number {
	const waited = Math.max(0, now - joinedAt);
	const steps = Math.floor(waited / MATCHMAKING_BAND_STEP_MS);
	return MATCHMAKING_INITIAL_BAND + steps * MATCHMAKING_BAND_STEP;
}

export function ratingsCompatible(
	ratingA: number,
	ratingB: number,
	joinedAtA: number,
	joinedAtB: number,
	now: number,
): boolean {
	const band = Math.max(
		matchmakingBandMs(joinedAtA, now),
		matchmakingBandMs(joinedAtB, now),
	);
	return Math.abs(ratingA - ratingB) <= band;
}
