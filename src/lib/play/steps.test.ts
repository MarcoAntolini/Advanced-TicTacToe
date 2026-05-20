import { describe, expect, it } from "vitest";
import { buildPlayHref, parsePlayStep, playStepLabel } from "./steps";

describe("parsePlayStep", () => {
	it("defaults to choose for missing or invalid step", () => {
		expect(parsePlayStep(null)).toBe("choose");
		expect(parsePlayStep("")).toBe("choose");
		expect(parsePlayStep("invalid")).toBe("choose");
	});

	it("accepts valid wizard steps", () => {
		expect(parsePlayStep("multiplayer")).toBe("multiplayer");
		expect(parsePlayStep("create")).toBe("create");
	});
});

describe("playStepLabel", () => {
	it("returns labels for nested steps only", () => {
		expect(playStepLabel("choose")).toBeNull();
		expect(playStepLabel("multiplayer")).toBe("Multiplayer");
		expect(playStepLabel("create")).toBe("Create game");
	});
});

describe("buildPlayHref", () => {
	it("omits query on choose step", () => {
		expect(buildPlayHref("choose")).toBe("/play");
	});

	it("adds step and optional params", () => {
		expect(buildPlayHref("multiplayer")).toBe("/play?step=multiplayer");
		expect(buildPlayHref("create", { mode: "async" })).toBe(
			"/play?step=create&mode=async",
		);
	});

	it("skips empty param values", () => {
		expect(buildPlayHref("create", { mode: "" })).toBe("/play?step=create");
	});
});
