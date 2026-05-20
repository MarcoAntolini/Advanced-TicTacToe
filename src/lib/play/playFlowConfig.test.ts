import { describe, expect, it } from "vitest";
import { DEFAULT_CREATE_SETTINGS, toCreateMutationArgs } from "./playFlowConfig";

describe("toCreateMutationArgs", () => {
	it("maps casual realtime settings", () => {
		expect(
			toCreateMutationArgs({
				...DEFAULT_CREATE_SETTINGS,
				visibility: "public",
				mode: "realtime",
				rules: "normal",
			}),
		).toEqual({
			mode: "realtime",
			visibility: "public",
			rankedRules: false,
		});
	});

	it("enables ranked practice only for realtime", () => {
		expect(
			toCreateMutationArgs({
				...DEFAULT_CREATE_SETTINGS,
				mode: "realtime",
				rules: "ranked-practice",
			}),
		).toEqual({
			mode: "realtime",
			visibility: "private",
			rankedRules: true,
		});

		expect(
			toCreateMutationArgs({
				...DEFAULT_CREATE_SETTINGS,
				mode: "async",
				rules: "ranked-practice",
			}),
		).toEqual({
			mode: "async",
			visibility: "private",
			rankedRules: false,
		});
	});
});
