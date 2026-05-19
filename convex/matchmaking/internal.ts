import { internalMutation } from "../_generated/server";

const STALE_MS = 60 * 1000;

export const expireStale = internalMutation({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();
		for (const mode of ["realtime", "async"] as const) {
			const entries = await ctx.db
				.query("matchmakingQueue")
				.withIndex("by_mode_time", (q) => q.eq("mode", mode))
				.collect();

			for (const entry of entries) {
				if (now - entry.joinedAt > STALE_MS) {
					await ctx.db.delete(entry._id);
				}
			}
		}
	},
});
