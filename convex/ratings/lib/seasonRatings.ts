import { DEFAULT_RATING } from "@shared/ratings/elo";
import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

/**
 * Keeps `seasonRatings` in sync with `users.rating` / `users.ratedGames`.
 * Not used for reads yet — prepares per-season ladder without changing current behavior.
 */
export async function mirrorUserRatingToSeason(
	ctx: MutationCtx,
	userId: Id<"users">,
	seasonId: number,
) {
	const user = await ctx.db.get(userId);
	if (!user) return;

	const rating = user.rating ?? DEFAULT_RATING;
	const ratedGames = user.ratedGames ?? 0;

	const row = await ctx.db
		.query("seasonRatings")
		.withIndex("by_user_season", (q) =>
			q.eq("userId", userId).eq("seasonId", seasonId),
		)
		.unique();

	if (row) {
		await ctx.db.patch(row._id, { rating, ratedGames });
		return;
	}

	await ctx.db.insert("seasonRatings", {
		userId,
		seasonId,
		rating,
		ratedGames,
	});
}
