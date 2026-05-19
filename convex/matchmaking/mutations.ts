import { v } from "convex/values";
import { casualQueueKindFromMode } from "@shared/policy/queueKind";
import { DEFAULT_RATING } from "@shared/ratings/elo";
import { queueKindValidator } from "../lib/validators";
import { mutation } from "../_generated/server";
import { getOptionalUserId, requireUserId } from "../lib/auth";
import {
	acknowledgeQueueMatch,
	cancelInQueue,
	enqueueInQueue,
	resolveQueueKinds,
} from "../lib/matchmaking/queue";

const queueMode = v.union(v.literal("realtime"), v.literal("async"));

export const enqueue = mutation({
	args: {
		guestId: v.optional(v.string()),
		mode: v.optional(queueMode),
		queueKind: v.optional(queueKindValidator),
	},
	handler: async (ctx, args) => {
		const queueKind =
			args.queueKind ?? casualQueueKindFromMode(args.mode ?? "realtime");

		if (queueKind === "ranked-rated") {
			const userId = await requireUserId(ctx);
			const me = await ctx.db.get(userId);
			return enqueueInQueue(ctx, {
				queueKind,
				playerRef: userId,
				ratingAtJoin: me?.rating ?? DEFAULT_RATING,
			});
		}

		const userId = await getOptionalUserId(ctx);
		const playerRef = userId ?? args.guestId;
		if (!playerRef) throw new Error("guestId or authentication required");

		return enqueueInQueue(ctx, { queueKind, playerRef });
	},
});

export const cancel = mutation({
	args: {
		guestId: v.optional(v.string()),
		mode: v.optional(queueMode),
		queueKind: v.optional(queueKindValidator),
	},
	handler: async (ctx, args) => {
		const queueKinds = resolveQueueKinds(args);

		if (queueKinds.length === 1 && queueKinds[0] === "ranked-rated") {
			const userId = await requireUserId(ctx);
			await cancelInQueue(ctx, userId, queueKinds);
			return;
		}

		const userId = await getOptionalUserId(ctx);
		const playerRef = userId ?? args.guestId;
		if (!playerRef) return;

		await cancelInQueue(ctx, playerRef, queueKinds);
	},
});

export const acknowledgeMatch = mutation({
	args: {
		guestId: v.optional(v.string()),
		mode: v.optional(queueMode),
		queueKind: v.optional(queueKindValidator),
	},
	handler: async (ctx, args) => {
		const queueKinds = resolveQueueKinds(args);

		if (queueKinds.length === 1 && queueKinds[0] === "ranked-rated") {
			const userId = await requireUserId(ctx);
			await acknowledgeQueueMatch(ctx, userId, queueKinds);
			return;
		}

		const userId = await getOptionalUserId(ctx);
		const playerRef = userId ?? args.guestId;
		if (!playerRef) return;

		await acknowledgeQueueMatch(ctx, playerRef, queueKinds);
	},
});
