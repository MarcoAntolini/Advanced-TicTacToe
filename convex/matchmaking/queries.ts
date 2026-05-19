import { v } from "convex/values";
import { query } from "../_generated/server";
import { getOptionalUserId } from "../lib/auth";
import { getQueueStatus } from "../lib/matchmaking/queue";

export const getMyStatus = query({
	args: { guestId: v.optional(v.string()) },
	handler: async (ctx, args) => {
		const userId = await getOptionalUserId(ctx);
		const playerRef = userId ?? args.guestId;
		return getQueueStatus(ctx, playerRef);
	},
});
