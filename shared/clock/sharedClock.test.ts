import { describe, expect, it } from "vitest";
import { applyIncrement, deductActiveClock, formatClockMs } from "./sharedClock";

describe("sharedClock", () => {
	const base = {
		clockXMs: 60_000,
		clockOMs: 60_000,
		incrementMs: 3_000,
		turnStartedAt: 1_000,
		currentPlayer: "X" as const,
	};

	it("deducts elapsed time from active player", () => {
		const result = deductActiveClock(base, 11_000);
		expect(result.clockXMs).toBe(50_000);
		expect(result.clockOMs).toBe(60_000);
		expect(result.expired).toBe(false);
	});

	it("flags expiry when bank hits zero", () => {
		const result = deductActiveClock(base, 61_500);
		expect(result.expired).toBe(true);
		expect(result.timedOutPlayer).toBe("X");
	});

	it("adds increment to mover", () => {
		expect(applyIncrement(50_000, 60_000, "X", 3_000)).toEqual({
			clockXMs: 53_000,
			clockOMs: 60_000,
		});
	});

	it("formats mm:ss", () => {
		expect(formatClockMs(125_000)).toBe("2:05");
		expect(formatClockMs(500)).toBe("0:01");
	});
});
