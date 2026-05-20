import { describe, expect, it } from "vitest";
import { normalizeInviteCode } from "./normalize";

describe("normalizeInviteCode", () => {
	it("trims, uppercases, and removes spaces", () => {
		expect(normalizeInviteCode("  jwu5 me ")).toBe("JWU5ME");
		expect(normalizeInviteCode("abcd")).toBe("ABCD");
	});
});
