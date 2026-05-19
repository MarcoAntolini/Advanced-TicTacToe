import { describe, expect, it } from "vitest";
import { finishedAtSortKey, mergePickNext } from "./gameHistory";

function game(id: string, finishedAt: number, creationTime = finishedAt) {
	return {
		_id: id,
		_creationTime: creationTime,
		finishedAt,
	};
}

describe("gameHistory merge", () => {
	it("picks newer finishedAt first", () => {
		expect(mergePickNext(game("a", 100), game("b", 200))).toBe("o");
		expect(mergePickNext(game("b", 200), game("a", 100))).toBe("x");
	});

	it("breaks ties by game id", () => {
		expect(mergePickNext(game("a", 100), game("b", 100))).toBe("o");
	});

	it("uses creation time when finishedAt missing", () => {
		const fallback = {
			_id: "b",
			_creationTime: 150,
			finishedAt: undefined as number | undefined,
		};
		expect(finishedAtSortKey(fallback)).toBe(150);
		expect(mergePickNext(game("a", 100), fallback)).toBe("o");
	});
});
