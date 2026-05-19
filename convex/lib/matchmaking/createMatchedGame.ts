import { createFieldsForRatedRanked } from "@shared/policy/gameClassification";
import { rankedClockFields } from "@shared/clock/rankedDefaults";
import type { QueueKind } from "@shared/policy/queueKind";
import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { generateInviteCode } from "../auth";
import { createInitialState, serializeGameState } from "../game";

export async function createMatchedGame(
	ctx: MutationCtx,
	args: {
		queueKind: QueueKind;
		playerX: Id<"users"> | string;
		playerO: Id<"users"> | string;
	},
): Promise<Id<"games">> {
	const now = Date.now();

	if (args.queueKind === "ranked-rated") {
		return await ctx.db.insert("games", {
			mode: "realtime",
			...createFieldsForRatedRanked(rankedClockFields()),
			status: "active",
			playerX: args.playerX,
			playerO: args.playerO,
			state: serializeGameState(createInitialState()),
			currentTurnStartedAt: now,
		});
	}

	const mode = args.queueKind === "casual-async" ? "async" : "realtime";
	const inviteCode = generateInviteCode();

	return await ctx.db.insert("games", {
		mode,
		status: "active",
		inviteCode,
		visibility: "private",
		playerX: args.playerX,
		playerO: args.playerO,
		state: serializeGameState(createInitialState()),
		currentTurnStartedAt: now,
	});
}
