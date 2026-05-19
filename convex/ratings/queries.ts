import { v } from "convex/values";
import { query } from "../_generated/server";
import { getOptionalUserId } from "../lib/auth";
import { DEFAULT_RATING } from "@shared/ratings/elo";
import { LEADERBOARD_MIN_GAMES } from "./lib/constants";
import { getActiveSeason, getActiveSeasonId } from "./lib/seasons";

function qualifiesForLeaderboard(ratedGames: number | undefined): boolean {
	return (ratedGames ?? 0) >= LEADERBOARD_MIN_GAMES;
}

export const getSeason = query({
	args: {},
	handler: async (ctx) => {
		const season = await getActiveSeason(ctx);
		return {
			seasonId: season.seasonId,
			label: season.label,
			leaderboardMinGames: LEADERBOARD_MIN_GAMES,
			startsAt: season.startsAt,
			endsAt: season.endsAt,
		};
	},
});

export const listLeaderboard = query({
	args: { limit: v.optional(v.number()) },
	handler: async (ctx, args) => {
		const limit = Math.min(args.limit ?? 50, 100);
		const rows = await ctx.db
			.query("users")
			.withIndex("by_rating")
			.order("desc")
			.collect();

		const qualified = rows.filter((u) => qualifiesForLeaderboard(u.ratedGames));
		const page = qualified.slice(0, limit);

		return page.map((u, i) => ({
			rank: i + 1,
			userId: u._id,
			displayName: u.displayName,
			avatarUrl: u.avatarUrl,
			rating: u.rating ?? DEFAULT_RATING,
			ratedGames: u.ratedGames ?? 0,
			stats: u.stats,
		}));
	},
});

export const getForGame = query({
	args: { gameId: v.id("games") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("ratingResults")
			.withIndex("by_game", (q) => q.eq("gameId", args.gameId))
			.unique();
	},
});

export const getMyRankContext = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getOptionalUserId(ctx);
		if (!userId) return null;

		const user = await ctx.db.get(userId);
		if (!user) return null;

		const myRating = user.rating ?? DEFAULT_RATING;
		const ratedGames = user.ratedGames ?? 0;
		const onLeaderboard = qualifiesForLeaderboard(ratedGames);

		const rows = await ctx.db
			.query("users")
			.withIndex("by_rating")
			.order("desc")
			.collect();
		const qualified = rows.filter((u) => qualifiesForLeaderboard(u.ratedGames));
		const rank = onLeaderboard
			? qualified.findIndex((u) => u._id === userId) + 1
			: null;

		return {
			userId,
			rating: myRating,
			ratedGames,
			rank,
			onLeaderboard,
			gamesUntilLeaderboard: onLeaderboard
				? 0
				: Math.max(0, LEADERBOARD_MIN_GAMES - ratedGames),
		};
	},
});

export const listMyRatingHistory = query({
	args: { limit: v.optional(v.number()) },
	handler: async (ctx, args) => {
		const userId = await getOptionalUserId(ctx);
		if (!userId) return [];

		const limit = Math.min(args.limit ?? 30, 50);

		const asX = await ctx.db
			.query("ratingResults")
			.withIndex("by_playerX_time", (q) => q.eq("playerXId", userId))
			.order("desc")
			.take(limit);

		const asO = await ctx.db
			.query("ratingResults")
			.withIndex("by_playerO_time", (q) => q.eq("playerOId", userId))
			.order("desc")
			.take(limit);

		const activeSeasonId = await getActiveSeasonId(ctx);
		const merged = [...asX, ...asO]
			.filter((r) => (r.seasonId ?? activeSeasonId) === activeSeasonId)
			.sort((a, b) => b.appliedAt - a.appliedAt)
			.slice(0, limit);

		const opponentIds = new Set(
			merged.map((r) => (r.playerXId === userId ? r.playerOId : r.playerXId)),
		);
		const opponents = await Promise.all(
			[...opponentIds].map((id) => ctx.db.get(id)),
		);
		const nameById = new Map(
			opponents.filter(Boolean).map((u) => [u!._id, u!.displayName]),
		);

		return merged.map((r) => {
			const isX = r.playerXId === userId;
			const delta = isX ? r.deltaX : r.deltaO;
			const ratingAfter = isX ? r.ratingXAfter : r.ratingOAfter;
			const opponentId = isX ? r.playerOId : r.playerXId;
			const won =
				r.outcome === "draw"
					? null
					: (r.outcome === "X" && isX) || (r.outcome === "O" && !isX);

			return {
				gameId: r.gameId,
				appliedAt: r.appliedAt,
				delta,
				ratingAfter,
				opponentName: nameById.get(opponentId) ?? "Opponent",
				result: won === null ? ("draw" as const) : won ? ("win" as const) : ("loss" as const),
			};
		});
	},
});
