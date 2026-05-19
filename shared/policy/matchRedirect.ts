import type { QueueKind } from "./queueKind";

export type MatchRedirectStatus = {
	rankedRated: { matchedGameId: string | null };
	casualRealtime: { matchedGameId: string | null };
	casualAsync: { matchedGameId: string | null };
};

/** Priority: ranked-rated → casual-realtime → casual-async. */
export function pickMatchedRedirect(
	status: MatchRedirectStatus,
): { gameId: string; queueKind: QueueKind } | null {
	if (status.rankedRated.matchedGameId) {
		return { gameId: status.rankedRated.matchedGameId, queueKind: "ranked-rated" };
	}
	if (status.casualRealtime.matchedGameId) {
		return { gameId: status.casualRealtime.matchedGameId, queueKind: "casual-realtime" };
	}
	if (status.casualAsync.matchedGameId) {
		return { gameId: status.casualAsync.matchedGameId, queueKind: "casual-async" };
	}
	return null;
}
