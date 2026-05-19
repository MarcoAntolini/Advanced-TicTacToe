import { internalMutation } from "../_generated/server";

const STALE_MS = 60 * 1000;

export const expireStale = internalMutation({
	args: {},
	handler: async (ctx) => {
		const entries = await ctx.db.query("rankedMatchmakingQueue").withIndex("by_joinedAt").collect();
		const now = Date.now();
		for (const entry of entries) {
			if (now - entry.joinedAt > STALE_MS) {
				await ctx.db.delete(entry._id);
			}
		}
	},
});
