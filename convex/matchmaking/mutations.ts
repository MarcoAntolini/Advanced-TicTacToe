import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { generateInviteCode, getOptionalUserId } from "../lib/auth";
import { createInitialState, serializeGameState } from "../lib/game";
import { findActiveRealtimeGame } from "../lib/room";
export const enqueue = mutation({
	args: {
		guestId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getOptionalUserId(ctx);
		const playerRef = userId ?? args.guestId;
		if (!playerRef) throw new Error("guestId or authentication required");

		const existing = await ctx.db
			.query("matchmakingQueue")
			.withIndex("by_mode_time", (q) => q.eq("mode", "realtime"))
			.collect();

		const myEntry = existing.find((e) => e.userId === playerRef);

		const activeGame = await findActiveRealtimeGame(ctx, playerRef);
		if (activeGame) {
			return {
				matched: false as const,
				blocked: true as const,
				gameId: activeGame._id,
				reason: "already_in_active_realtime" as const,
			};
		}

		const opponent = existing.find((e) => e.userId !== playerRef);
		if (opponent) {
			await ctx.db.delete(opponent._id);
			if (myEntry) await ctx.db.delete(myEntry._id);
			const inviteCode = generateInviteCode();
			const gameId = await ctx.db.insert("games", {
				mode: "realtime",
				status: "active",
				inviteCode,
				playerX: opponent.userId,
				playerO: playerRef,
				state: serializeGameState(createInitialState()),
				currentTurnStartedAt: Date.now(),
			});
			return { matched: true as const, gameId };
		}

		if (myEntry) {
			return { matched: false as const, inQueue: true as const };
		}

		await ctx.db.insert("matchmakingQueue", {
			userId: playerRef,
			mode: "realtime",
			joinedAt: Date.now(),
		});

		return { matched: false as const };
	},
});

export const cancel = mutation({
	args: {
		guestId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getOptionalUserId(ctx);
		const playerRef = userId ?? args.guestId;
		if (!playerRef) return;

		const entries = await ctx.db
			.query("matchmakingQueue")
			.withIndex("by_mode_time", (q) => q.eq("mode", "realtime"))
			.collect();

		for (const entry of entries) {
			if (entry.userId === playerRef) {
				await ctx.db.delete(entry._id);
			}
		}
	},
});
