import { describe, expect, it } from "vitest";
import {
	casualQueueKindFromMode,
	isRankedQueueKind,
	queueKindRequiresAuth,
	queueKindUsesRealtimeBlock,
} from "./queueKind";

describe("queueKind", () => {
	it("maps casual modes to queue kinds", () => {
		expect(casualQueueKindFromMode("realtime")).toBe("casual-realtime");
		expect(casualQueueKindFromMode("async")).toBe("casual-async");
	});

	it("flags ranked auth and blocking rules", () => {
		expect(isRankedQueueKind("ranked-rated")).toBe(true);
		expect(isRankedQueueKind("casual-realtime")).toBe(false);
		expect(queueKindRequiresAuth("ranked-rated")).toBe(true);
		expect(queueKindUsesRealtimeBlock("casual-async")).toBe(false);
		expect(queueKindUsesRealtimeBlock("casual-realtime")).toBe(true);
	});
});
