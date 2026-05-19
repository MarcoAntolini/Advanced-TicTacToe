import { isAsyncTurnExpired } from "@shared/policy/asyncTurn";
import { internalMutation } from "../_generated/server";
import { endGame } from "../lib/endGame";

export const expireAsyncTurns = internalMutation({
	args: {},
	handler: async (ctx) => {
		const games = await ctx.db
			.query("games")
			.withIndex("by_status_mode", (q) => q.eq("status", "active").eq("mode", "async"))
			.collect();

		const now = Date.now();
		for (const game of games) {
			if (!isAsyncTurnExpired(game.currentTurnStartedAt, now)) continue;
			const inactive = game.state.currentPlayer === "X" ? "O" : "X";
			await endGame(ctx, game, inactive);
		}
	},
});
