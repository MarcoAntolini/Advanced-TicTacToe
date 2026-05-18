import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { generateInviteCode, getOptionalUserId } from "../lib/auth";
import { createInitialState, serializeGameState } from "../lib/game";
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

		const alreadyQueued = existing.some((e) => e.userId === playerRef);
		if (alreadyQueued) throw new Error("Already in queue");

		const activeGames = await ctx.db
			.query("games")
			.withIndex("by_status_mode", (q) =>
				q.eq("status", "active").eq("mode", "realtime"),
			)
			.collect();

		const inActiveGame = activeGames.some(
			(g) => g.playerX === playerRef || g.playerO === playerRef,
		);
		if (inActiveGame) throw new Error("Already in an active game");

		const opponent = existing.find((e) => e.userId !== playerRef);
		if (opponent) {
			await ctx.db.delete(opponent._id);
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
