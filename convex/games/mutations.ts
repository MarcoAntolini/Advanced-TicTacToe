import { Player } from "@/types/game";
import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const createGame = mutation({
	args: {},
	handler: async (ctx, args) => {
		const player: Player = Math.floor(Math.random() * 2) === 0 ? "X" : "O";
		const opponent: Player = player === "X" ? "O" : "X";
		await ctx.db.insert("games", {
			player: player,
			opponent: opponent,
		});

		return {};
	},
});
