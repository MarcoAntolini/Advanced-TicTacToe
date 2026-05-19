import { describe, expect, it } from "vitest";
import { applyEloPair, DEFAULT_RATING, expectedScore, ratingDelta } from "./elo";

describe("Elo", () => {
	it("expected score is 0.5 for equal ratings", () => {
		expect(expectedScore(1200, 1200)).toBeCloseTo(0.5, 5);
	});

	it("equal ratings yield symmetric deltas on win", () => {
		const { deltaX, deltaO } = applyEloPair(1200, 1200, "X");
		expect(deltaX).toBe(16);
		expect(deltaO).toBe(-16);
	});

	it("draw nudges both players slightly when equal", () => {
		const { deltaX, deltaO } = applyEloPair(1200, 1200, "draw");
		expect(deltaX).toBe(0);
		expect(deltaO).toBe(0);
	});

	it("underdog gains more points on an upset win", () => {
		const favouriteWin = applyEloPair(1400, 1200, "X");
		const upsetWin = applyEloPair(1200, 1400, "X");
		expect(upsetWin.deltaX).toBeGreaterThan(favouriteWin.deltaX);
	});

	it("ratingDelta rounds to integer", () => {
		expect(ratingDelta(DEFAULT_RATING, DEFAULT_RATING, 1)).toBe(16);
	});
});
