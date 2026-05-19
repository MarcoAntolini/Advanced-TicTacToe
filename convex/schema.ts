import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { gameStateValidator, statsValidator } from "./lib/validators";

const playerRef = v.union(v.id("users"), v.string(), v.null());

export default defineSchema({
	users: defineTable({
		clerkId: v.string(),
		displayName: v.string(),
		avatarUrl: v.optional(v.string()),
		stats: statsValidator,
		rating: v.optional(v.number()),
		ratedGames: v.optional(v.number()),
	})
		.index("by_clerk", ["clerkId"])
		.index("by_rating", ["rating"]),

	games: defineTable({
		mode: v.union(v.literal("local"), v.literal("realtime"), v.literal("async")),
		isRanked: v.optional(v.boolean()),
		rated: v.optional(v.boolean()),
		visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
		status: v.union(v.literal("waiting"), v.literal("active"), v.literal("finished")),
		inviteCode: v.optional(v.string()),
		playerX: playerRef,
		playerO: playerRef,
		state: gameStateValidator,
		winner: v.optional(v.union(v.literal("X"), v.literal("O"), v.literal("draw"))),
		currentTurnStartedAt: v.optional(v.number()),
		clockXMs: v.optional(v.number()),
		clockOMs: v.optional(v.number()),
		clockIncrementMs: v.optional(v.number()),
		finishedAt: v.optional(v.number()),
	})
		.index("by_invite", ["inviteCode"])
		.index("by_status_mode", ["status", "mode"])
		.index("by_status_ranked", ["status", "isRanked"])
		.index("by_status_visibility_mode", ["status", "visibility", "mode"]),

	matchmakingQueue: defineTable({
		userId: playerRef,
		mode: v.union(v.literal("realtime"), v.literal("async")),
		joinedAt: v.number(),
	}).index("by_mode_time", ["mode", "joinedAt"]),

	rankedMatchmakingQueue: defineTable({
		userId: v.id("users"),
		joinedAt: v.number(),
		ratingAtJoin: v.number(),
	}).index("by_joinedAt", ["joinedAt"]),

	seasons: defineTable({
		seasonId: v.number(),
		label: v.string(),
		startsAt: v.optional(v.number()),
		endsAt: v.optional(v.number()),
		isActive: v.boolean(),
	})
		.index("by_seasonId", ["seasonId"])
		.index("by_active", ["isActive"]),

	seasonRatings: defineTable({
		userId: v.id("users"),
		seasonId: v.number(),
		rating: v.number(),
		ratedGames: v.number(),
	})
		.index("by_user_season", ["userId", "seasonId"])
		.index("by_season_rating", ["seasonId", "rating"]),

	ratingResults: defineTable({
		gameId: v.id("games"),
		seasonId: v.optional(v.number()),
		appliedAt: v.number(),
		outcome: v.union(v.literal("X"), v.literal("O"), v.literal("draw")),
		playerXId: v.id("users"),
		playerOId: v.id("users"),
		ratingXBefore: v.number(),
		ratingOBefore: v.number(),
		ratingXAfter: v.number(),
		ratingOAfter: v.number(),
		deltaX: v.number(),
		deltaO: v.number(),
	})
		.index("by_game", ["gameId"])
		.index("by_playerX_time", ["playerXId", "appliedAt"])
		.index("by_playerO_time", ["playerOId", "appliedAt"])
		.index("by_season", ["seasonId"]),
});
