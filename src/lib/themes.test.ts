import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, isThemeId, themes } from "./themes";

describe("isThemeId", () => {
	it("accepts known theme ids", () => {
		for (const theme of themes) {
			expect(isThemeId(theme.id)).toBe(true);
		}
	});

	it("rejects unknown values", () => {
		expect(isThemeId(null)).toBe(false);
		expect(isThemeId("")).toBe(false);
		expect(isThemeId("not-a-theme")).toBe(false);
	});

	it("defaults to midnight", () => {
		expect(DEFAULT_THEME).toBe("midnight");
		expect(isThemeId(DEFAULT_THEME)).toBe(true);
	});
});
