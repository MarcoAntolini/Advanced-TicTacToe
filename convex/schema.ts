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
	})
		.index("by_clerk", ["clerkId"])
		.index("by_rating", ["rating"]),

	games: defineTable({
		mode: v.union(v.literal("local"), v.literal("realtime"), v.literal("async")),
		isRanked: v.optional(v.boolean()),
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
		.index("by_status_ranked", ["status", "isRanked"]),

	matchmakingQueue: defineTable({
		userId: playerRef,
		mode: v.literal("realtime"),
		joinedAt: v.number(),
	}).index("by_mode_time", ["mode", "joinedAt"]),

	rankedMatchmakingQueue: defineTable({
		userId: v.id("users"),
		joinedAt: v.number(),
	}).index("by_joinedAt", ["joinedAt"]),

	ratingResults: defineTable({
		gameId: v.id("games"),
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
	}).index("by_game", ["gameId"]),
});
