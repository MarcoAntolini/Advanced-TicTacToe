/** Fischer initial time per side (5 minutes). */
export const RANKED_INITIAL_MS = 5 * 60 * 1000;

/** Fischer increment per completed move (3 seconds). */
export const RANKED_INCREMENT_MS = 3 * 1000;

export function rankedClockFields() {
	return {
		clockXMs: RANKED_INITIAL_MS,
		clockOMs: RANKED_INITIAL_MS,
		clockIncrementMs: RANKED_INCREMENT_MS,
	};
}
