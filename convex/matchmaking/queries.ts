import { v } from "convex/values";
import { query } from "../_generated/server";
import { getOptionalUserId } from "../lib/auth";

export const getMyStatus = query({
	args: { guestId: v.optional(v.string()) },
	handler: async (ctx, args) => {
		const userId = await getOptionalUserId(ctx);
		const playerRef = userId ?? args.guestId;
		if (!playerRef) return { inQueue: false };

		const entries = await ctx.db
			.query("matchmakingQueue")
			.withIndex("by_mode_time", (q) => q.eq("mode", "realtime"))
			.collect();

		return { inQueue: entries.some((e) => e.userId === playerRef) };
	},
});
