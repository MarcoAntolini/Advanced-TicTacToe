import { describe, expect, it } from "vitest";
import {
	classifyGame,
	createFieldsForPracticeRanked,
	createFieldsForRatedRanked,
	gameDisplayMode,
	lobbyListingFields,
	rematchClassificationFields,
	shouldApplyRating,
} from "./gameClassification";

describe("gameClassification", () => {
	it("classifies casual games", () => {
		expect(classifyGame({})).toBe("casual");
		expect(classifyGame({ isRanked: false })).toBe("casual");
	});

	it("classifies ranked practice and rated", () => {
		expect(classifyGame({ isRanked: true, rated: false })).toBe("ranked-practice");
		expect(classifyGame({ isRanked: true, rated: true })).toBe("ranked-rated");
	});

	it("preserves rated on rematch", () => {
		expect(rematchClassificationFields({ isRanked: true, rated: true })).toEqual({
			isRanked: true,
			rated: true,
		});
		expect(rematchClassificationFields({ isRanked: true, rated: false })).toEqual({
			isRanked: true,
		});
	});

	it("builds create fields for ranked modes", () => {
		const clock = { clockXMs: 1, clockOMs: 1, clockIncrementMs: 1 };
		expect(createFieldsForPracticeRanked(clock)).toEqual({
			isRanked: true,
			rated: false,
			...clock,
		});
		expect(createFieldsForRatedRanked(clock)).toEqual({
			isRanked: true,
			rated: true,
			...clock,
		});
	});

	it("gates rating and display mode by classification", () => {
		expect(shouldApplyRating({ isRanked: true, rated: true })).toBe(true);
		expect(shouldApplyRating({ isRanked: true, rated: false })).toBe(false);
		expect(gameDisplayMode({ mode: "realtime", isRanked: true, rated: true })).toBe(
			"ranked-rated",
		);
		expect(gameDisplayMode({ mode: "async" })).toBe("async");
		expect(lobbyListingFields({ isRanked: true, rated: false }).isPractice).toBe(true);
	});
});
