import { describe, expect, it } from "vitest";
import { isAsyncTurnExpired, ASYNC_TURN_TIMEOUT_MS } from "./asyncTurn";
import { pickMatchedRedirect } from "./matchRedirect";

describe("matchRedirect", () => {
	const empty = {
		rankedRated: { matchedGameId: null },
		casualRealtime: { matchedGameId: null },
		casualAsync: { matchedGameId: null },
	};

	it("prioritizes ranked over casual", () => {
		expect(
			pickMatchedRedirect({
				...empty,
				rankedRated: { matchedGameId: "ranked-game" },
				casualRealtime: { matchedGameId: "casual-game" },
			}),
		).toEqual({ gameId: "ranked-game", queueKind: "ranked-rated" });
	});

	it("falls through to casual realtime then async", () => {
		expect(
			pickMatchedRedirect({
				...empty,
				casualRealtime: { matchedGameId: "rt" },
			}),
		).toEqual({ gameId: "rt", queueKind: "casual-realtime" });
		expect(
			pickMatchedRedirect({
				...empty,
				casualAsync: { matchedGameId: "async" },
			}),
		).toEqual({ gameId: "async", queueKind: "casual-async" });
	});
});

describe("asyncTurn", () => {
	it("detects expired turns", () => {
		const now = 1_000_000;
		expect(isAsyncTurnExpired(undefined, now)).toBe(false);
		expect(isAsyncTurnExpired(now - ASYNC_TURN_TIMEOUT_MS - 1, now)).toBe(true);
		expect(isAsyncTurnExpired(now - 1000, now)).toBe(false);
	});
});
