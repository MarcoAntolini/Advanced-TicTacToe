import { query } from "../_generated/server";
import { getOptionalUserId } from "../lib/auth";

export const getMyStatus = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getOptionalUserId(ctx);
		if (!userId) return { inQueue: false };

		const entries = await ctx.db.query("rankedMatchmakingQueue").withIndex("by_joinedAt").collect();
		return { inQueue: entries.some((e) => e.userId === userId) };
	},
});
