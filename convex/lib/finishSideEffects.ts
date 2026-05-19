import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { applyRatingResult } from "../ratings/lib/applyResult";
import { applyStatsResult } from "./stats";

export async function finishSideEffects(
	ctx: MutationCtx,
	game: Pick<Doc<"games">, "isRanked" | "playerX" | "playerO" | "_id">,
	outcome: "X" | "O" | "draw",
) {
	await applyStatsResult(ctx, outcome, game.playerX, game.playerO);
	await applyRatingResult(ctx, game, outcome);
}
