/** Async turn window per CONTEXT.md (72 hours). */
export const ASYNC_TURN_TIMEOUT_MS = 72 * 60 * 60 * 1000;

export function isAsyncTurnExpired(turnStartedAt: number | undefined, now: number): boolean {
	if (turnStartedAt === undefined) return false;
	return now - turnStartedAt > ASYNC_TURN_TIMEOUT_MS;
}
