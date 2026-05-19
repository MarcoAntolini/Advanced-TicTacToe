import { applyEloPair, DEFAULT_RATING, type EloOutcome } from "@shared/ratings/elo";
import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { isUserId } from "../../lib/isUserId";

export async function applyRatingResult(
	ctx: MutationCtx,
	game: Pick<Doc<"games">, "_id" | "isRanked" | "playerX" | "playerO">,
	outcome: EloOutcome,
) {
	if (!game.isRanked) return;
	if (!isUserId(game.playerX) || !isUserId(game.playerO)) return;

	const existing = await ctx.db
		.query("ratingResults")
		.withIndex("by_game", (q) => q.eq("gameId", game._id))
		.unique();
	if (existing) return;

	const [userX, userO] = await Promise.all([
		ctx.db.get(game.playerX),
		ctx.db.get(game.playerO),
	]);
	if (!userX || !userO) return;

	const beforeX = userX.rating ?? DEFAULT_RATING;
	const beforeO = userO.rating ?? DEFAULT_RATING;
	const { ratingX, ratingO, deltaX, deltaO } = applyEloPair(beforeX, beforeO, outcome);

	await ctx.db.insert("ratingResults", {
		gameId: game._id,
		appliedAt: Date.now(),
		outcome,
		playerXId: game.playerX,
		playerOId: game.playerO,
		ratingXBefore: beforeX,
		ratingOBefore: beforeO,
		ratingXAfter: ratingX,
		ratingOAfter: ratingO,
		deltaX,
		deltaO,
	});

	await ctx.db.patch(game.playerX, { rating: ratingX });
	await ctx.db.patch(game.playerO, { rating: ratingO });
}
