import { describe, expect, it } from "vitest";
import { buildJoinPath } from "./invite";

describe("buildJoinPath", () => {
	it("normalizes code in the join URL", () => {
		expect(buildJoinPath("  abcd ")).toBe("/join/ABCD");
	});
});
