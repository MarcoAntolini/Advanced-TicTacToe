import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "../_generated/server";
import { getOptionalUserId } from "../lib/auth";

export const get = query({
	args: { gameId: v.id("games") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.gameId);
	},
});

export const listHistory = query({
	args: { paginationOpts: paginationOptsValidator },
	handler: async (ctx, args) => {
		const userId = await getOptionalUserId(ctx);
		if (!userId) return { page: [], isDone: true, continueCursor: "" };

		const all = await ctx.db
			.query("games")
			.filter((q) => q.eq(q.field("status"), "finished"))
			.order("desc")
			.collect();

		const mine = all.filter((g) => g.playerX === userId || g.playerO === userId);
		const start = args.paginationOpts.cursor
			? parseInt(args.paginationOpts.cursor, 10)
			: 0;
		const numItems = args.paginationOpts.numItems;
		const page = mine.slice(start, start + numItems);
		const next = start + numItems;
		const isDone = next >= mine.length;

		return {
			page,
			isDone,
			continueCursor: isDone ? "" : String(next),
		};
	},
});

export const listMyTurns = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getOptionalUserId(ctx);
		if (!userId) return [];

		const active = await ctx.db
			.query("games")
			.withIndex("by_status_mode", (q) => q.eq("status", "active"))
			.collect();

		return active.filter((game) => {
			if (game.mode !== "async") return false;
			const isX = game.playerX === userId;
			const isO = game.playerO === userId;
			const myTurn =
				(game.state.currentPlayer === "X" && isX) ||
				(game.state.currentPlayer === "O" && isO);
			return myTurn;
		});
	},
});
