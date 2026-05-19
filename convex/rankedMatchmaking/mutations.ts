import { mutation } from "../_generated/server";
import { requireUserId } from "../lib/auth";
import { RANKED_INCREMENT_MS, RANKED_INITIAL_MS } from "../clock/lib/constants";
import { createInitialState, serializeGameState } from "../lib/game";
import { findActiveRealtimeGame } from "../lib/room";

export const enqueue = mutation({
	args: {},
	handler: async (ctx) => {
		const userId = await requireUserId(ctx);

		const activeGame = await findActiveRealtimeGame(ctx, userId);
		if (activeGame) {
			return {
				matched: false as const,
				blocked: true as const,
				gameId: activeGame._id,
				reason: "already_in_active_realtime" as const,
			};
		}

		const existing = await ctx.db.query("rankedMatchmakingQueue").withIndex("by_joinedAt").collect();
		const myEntry = existing.find((e) => e.userId === userId);
		const opponent = existing.find((e) => e.userId !== userId);

		if (opponent) {
			await ctx.db.delete(opponent._id);
			if (myEntry) await ctx.db.delete(myEntry._id);

			const now = Date.now();
			const gameId = await ctx.db.insert("games", {
				mode: "realtime",
				isRanked: true,
				status: "active",
				playerX: opponent.userId,
				playerO: userId,
				state: serializeGameState(createInitialState()),
				currentTurnStartedAt: now,
				clockXMs: RANKED_INITIAL_MS,
				clockOMs: RANKED_INITIAL_MS,
				clockIncrementMs: RANKED_INCREMENT_MS,
			});
			return { matched: true as const, gameId };
		}

		if (myEntry) {
			return { matched: false as const, inQueue: true as const };
		}

		await ctx.db.insert("rankedMatchmakingQueue", {
			userId,
			joinedAt: Date.now(),
		});

		return { matched: false as const };
	},
});

export const cancel = mutation({
	args: {},
	handler: async (ctx) => {
		const userId = await requireUserId(ctx);
		const entries = await ctx.db.query("rankedMatchmakingQueue").withIndex("by_joinedAt").collect();
		for (const entry of entries) {
			if (entry.userId === userId) {
				await ctx.db.delete(entry._id);
			}
		}
	},
});
