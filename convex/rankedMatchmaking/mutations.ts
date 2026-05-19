import { mutation } from "../_generated/server";
import { DEFAULT_RATING } from "@shared/ratings/elo";
import { requireUserId } from "../lib/auth";
import { RANKED_INCREMENT_MS, RANKED_INITIAL_MS } from "../clock/lib/constants";
import { createInitialState, serializeGameState } from "../lib/game";
import { findActiveRealtimeGame } from "../lib/room";
import { findRankedOpponent } from "../ratings/lib/matchmaking";

export const enqueue = mutation({
	args: {},
	handler: async (ctx) => {
		const userId = await requireUserId(ctx);
		const now = Date.now();

		const activeGame = await findActiveRealtimeGame(ctx, userId);
		if (activeGame) {
			return {
				matched: false as const,
				blocked: true as const,
				gameId: activeGame._id,
				reason: "already_in_active_realtime" as const,
			};
		}

		const me = await ctx.db.get(userId);
		const myRating = me?.rating ?? DEFAULT_RATING;

		const existing = await ctx.db
			.query("rankedMatchmakingQueue")
			.withIndex("by_joinedAt")
			.collect();
		const myEntry = existing.find((e) => e.userId === userId);
		const myJoinedAt = myEntry?.joinedAt ?? now;

		const opponent = findRankedOpponent(existing, userId, myRating, myJoinedAt, now);

		if (opponent) {
			await ctx.db.delete(opponent._id);
			if (myEntry) await ctx.db.delete(myEntry._id);

			const gameId = await ctx.db.insert("games", {
				mode: "realtime",
				isRanked: true,
				rated: true,
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
			joinedAt: now,
			ratingAtJoin: myRating,
		});

		return { matched: false as const };
	},
});

export const cancel = mutation({
	args: {},
	handler: async (ctx) => {
		const userId = await requireUserId(ctx);
		const entries = await ctx.db
			.query("rankedMatchmakingQueue")
			.withIndex("by_joinedAt")
			.collect();
		for (const entry of entries) {
			if (entry.userId === userId) {
				await ctx.db.delete(entry._id);
			}
		}
	},
});
