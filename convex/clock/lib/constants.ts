import { rankedClockFields } from "@shared/clock/rankedDefaults";

export { RANKED_INITIAL_MS, RANKED_INCREMENT_MS, rankedClockFields } from "@shared/clock/rankedDefaults";

/** @deprecated Use rankedClockFields() from @shared/clock/rankedDefaults */
export function rankedClockInsert() {
	return rankedClockFields();
}
