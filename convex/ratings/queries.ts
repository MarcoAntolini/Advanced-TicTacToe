import { v } from "convex/values";
import { query } from "../_generated/server";
import { getOptionalUserId } from "../lib/auth";
import { DEFAULT_RATING } from "@shared/ratings/elo";

export const listLeaderboard = query({
	args: { limit: v.optional(v.number()) },
	handler: async (ctx, args) => {
		const limit = Math.min(args.limit ?? 50, 100);
		const rows = await ctx.db.query("users").withIndex("by_rating").order("desc").take(limit);

		return rows.map((u, i) => ({
			rank: i + 1,
			userId: u._id,
			displayName: u.displayName,
			avatarUrl: u.avatarUrl,
			rating: u.rating ?? DEFAULT_RATING,
			stats: u.stats,
		}));
	},
});

export const getForGame = query({
	args: { gameId: v.id("games") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("ratingResults")
			.withIndex("by_game", (q) => q.eq("gameId", args.gameId))
			.unique();
	},
});

export const getMyRankContext = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getOptionalUserId(ctx);
		if (!userId) return null;

		const user = await ctx.db.get(userId);
		if (!user) return null;

		const myRating = user.rating ?? DEFAULT_RATING;
		const above = await ctx.db
			.query("users")
			.withIndex("by_rating")
			.filter((q) => q.gt(q.field("rating"), myRating))
			.collect();

		return {
			userId,
			rating: myRating,
			rank: above.length + 1,
		};
	},
});
