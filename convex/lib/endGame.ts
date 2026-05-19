import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { buildFinishedGamePatch } from "./finishGame";
import { finishSideEffects } from "./finishSideEffects";
import type { Player } from "./game";

type FinishableGame = Pick<
	Doc<"games">,
	| "_id"
	| "status"
	| "state"
	| "isRanked"
	| "rated"
	| "playerX"
	| "playerO"
>;

export type EndGameResult = {
	finished: boolean;
	alreadyFinished: boolean;
};

/** Single orchestrator for finishing a game and running side effects. */
export async function endGame(
	ctx: MutationCtx,
	game: FinishableGame,
	outcome: Player | "draw",
	extraPatch: Record<string, unknown> = {},
): Promise<EndGameResult> {
	if (game.status === "finished") {
		return { finished: true, alreadyFinished: true };
	}

	await ctx.db.patch(game._id, {
		...buildFinishedGamePatch(game, outcome),
		...extraPatch,
	});
	await finishSideEffects(ctx, game, outcome);

	return { finished: true, alreadyFinished: false };
}

export async function endGameById(
	ctx: MutationCtx,
	gameId: Id<"games">,
	outcome: Player | "draw",
	extraPatch: Record<string, unknown> = {},
): Promise<EndGameResult | null> {
	const game = await ctx.db.get(gameId);
	if (!game) return null;
	return endGame(ctx, game, outcome, extraPatch);
}
