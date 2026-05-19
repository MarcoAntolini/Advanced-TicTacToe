import { internalMutation } from "../_generated/server";
import { expireRankedGameOnClock } from "./lib/enforce";

export const expireRankedClocks = internalMutation({
	args: {},
	handler: async (ctx) => {
		const games = await ctx.db
			.query("games")
			.withIndex("by_status_ranked", (q) => q.eq("status", "active").eq("isRanked", true))
			.collect();

		for (const game of games) {
			await expireRankedGameOnClock(ctx, game);
		}
	},
});
