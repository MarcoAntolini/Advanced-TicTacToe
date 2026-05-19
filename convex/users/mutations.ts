import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getOptionalUserId } from "../lib/auth";

const defaultStats = { wins: 0, losses: 0, draws: 0, streak: 0 };

export const ensureUser = mutation({
	args: {
		displayName: v.string(),
		avatarUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error("Not authenticated");

		const existing = await ctx.db
			.query("users")
			.withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
			.unique();

		if (existing) {
			const patch: { displayName?: string; avatarUrl?: string } = {};
			if (existing.displayName !== args.displayName) {
				patch.displayName = args.displayName;
			}
			if (existing.avatarUrl !== args.avatarUrl) {
				patch.avatarUrl = args.avatarUrl;
			}
			if (Object.keys(patch).length > 0) {
				await ctx.db.patch(existing._id, patch);
			}
			return existing._id;
		}

		return await ctx.db.insert("users", {
			clerkId: identity.subject,
			displayName: args.displayName,
			avatarUrl: args.avatarUrl,
			stats: defaultStats,
		});
	},
});

export const mergeGuestGames = mutation({
	args: { guestId: v.string() },
	handler: async (ctx, args) => {
		const userId = await getOptionalUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		const games = await ctx.db.query("games").collect();
		for (const game of games) {
			let patch: { playerX?: typeof userId; playerO?: typeof userId } | null = null;
			if (game.playerX === args.guestId) patch = { playerX: userId };
			if (game.playerO === args.guestId) {
				patch = { ...(patch ?? {}), playerO: userId };
			}
			if (patch) await ctx.db.patch(game._id, patch);
		}
	},
});
