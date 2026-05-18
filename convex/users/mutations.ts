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
			await ctx.db.patch(existing._id, {
				displayName: args.displayName,
				avatarUrl: args.avatarUrl ?? existing.avatarUrl,
			});
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

export const updateProfile = mutation({
	args: {
		displayName: v.string(),
		avatarUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getOptionalUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		await ctx.db.patch(userId, {
			displayName: args.displayName,
			avatarUrl: args.avatarUrl,
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
