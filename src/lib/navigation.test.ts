import { describe, expect, it } from "vitest";
import { isNavActive, primaryNav } from "./navigation";

describe("isNavActive", () => {
	const play = primaryNav.find((item) => item.href === "/play")!;

	it("marks play active on play, join, and game routes", () => {
		expect(isNavActive("/play", play)).toBe(true);
		expect(isNavActive("/play/local", play)).toBe(true);
		expect(isNavActive("/join", play)).toBe(true);
		expect(isNavActive("/join/ABCD", play)).toBe(true);
		expect(isNavActive("/game/abc123", play)).toBe(true);
	});

	it("does not mark play active on unrelated routes", () => {
		expect(isNavActive("/", play)).toBe(false);
		expect(isNavActive("/rules", play)).toBe(false);
		expect(isNavActive("/leaderboard", play)).toBe(false);
	});

	it("uses item-specific match prefixes", () => {
		const rules = primaryNav.find((item) => item.href === "/rules")!;
		expect(isNavActive("/rules", rules)).toBe(true);
		expect(isNavActive("/rules/advanced", rules)).toBe(true);
		expect(isNavActive("/play", rules)).toBe(false);
	});
});
