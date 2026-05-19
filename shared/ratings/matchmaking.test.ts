import { describe, expect, it } from "vitest";
import { matchmakingBandMs, ratingsCompatible } from "./matchmaking";
import { MATCHMAKING_BAND_STEP_MS, MATCHMAKING_INITIAL_BAND } from "./constants";

describe("ranked matchmaking bands", () => {
	it("starts at initial band", () => {
		expect(matchmakingBandMs(1000, 5000)).toBe(MATCHMAKING_INITIAL_BAND);
	});

	it("widens after each step interval", () => {
		const joined = 0;
		const afterOneStep = MATCHMAKING_BAND_STEP_MS + 1;
		expect(matchmakingBandMs(joined, afterOneStep)).toBeGreaterThan(MATCHMAKING_INITIAL_BAND);
	});

	it("allows match within combined band", () => {
		expect(ratingsCompatible(1200, 1350, 0, 0, 1000)).toBe(true);
	});

	it("rejects far ratings early in queue", () => {
		expect(ratingsCompatible(1200, 1600, 0, 0, 1000)).toBe(false);
	});

	it("allows wider gap after waiting", () => {
		const now = MATCHMAKING_BAND_STEP_MS * 5;
		expect(ratingsCompatible(1200, 1600, 0, 0, now)).toBe(true);
	});
});
