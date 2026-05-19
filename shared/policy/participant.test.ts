import { describe, expect, it } from "vitest";
import { createInitialState } from "../game/engine";
import {
	canMoveAs,
	forfeitWinnerWhenLeaving,
	isParticipant,
	participantKeys,
	participantSide,
} from "./participant";

describe("participant", () => {
	const game = { playerX: "user_1", playerO: "guest_abc" };

	it("collects identity keys", () => {
		expect(participantKeys({ userId: "user_1", guestId: "guest_xyz" })).toEqual([
			"user_1",
			"guest_xyz",
		]);
	});

	it("matches any identity key to a slot", () => {
		expect(isParticipant(game, { userId: "user_1" })).toBe(true);
		expect(isParticipant(game, { guestId: "guest_abc" })).toBe(true);
		expect(isParticipant(game, { guestId: "guest_other" })).toBe(false);
	});

	it("resolves side and forfeit winner", () => {
		expect(participantSide(game, { guestId: "guest_abc" })).toBe("O");
		expect(forfeitWinnerWhenLeaving(game, { guestId: "guest_abc" })).toBe("X");
	});

	it("authorizes moves by side", () => {
		expect(canMoveAs({ ...game, mode: "realtime" }, { userId: "user_1" }, "X")).toBe(
			true,
		);
		expect(canMoveAs({ ...game, mode: "realtime" }, { guestId: "guest_abc" }, "X")).toBe(
			false,
		);
		expect(canMoveAs({ ...game, mode: "local" }, { guestId: "guest_other" }, "X")).toBe(
			true,
		);
	});
});

describe("displayState", () => {
	it("reconciles finished document with active engine state", async () => {
		const { reconcileDisplayState } = await import("./displayState");
		const state = createInitialState();
		const reconciled = reconcileDisplayState(state, {
			status: "finished",
			winner: "X",
		});
		expect(reconciled.status).toBe("won");
		expect(reconciled.winner).toBe("X");
	});
});

describe("joinConflict", () => {
	it("infers forfeit winner when both slots filled", async () => {
		const { inferConflictForfeitWinner } = await import("./joinConflict");
		expect(
			inferConflictForfeitWinner(
				{ playerX: "user_1", playerO: "guest_abc" },
				{ userId: "user_1" },
			),
		).toBe("O");
		expect(
			inferConflictForfeitWinner({ playerX: "user_1", playerO: null }, { userId: "user_1" }),
		).toBe(null);
	});
});
