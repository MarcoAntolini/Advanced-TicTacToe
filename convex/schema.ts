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
	}).index("by_clerk", ["clerkId"]),

	games: defineTable({
		mode: v.union(v.literal("local"), v.literal("realtime"), v.literal("async")),
		status: v.union(v.literal("waiting"), v.literal("active"), v.literal("finished")),
		inviteCode: v.optional(v.string()),
		playerX: playerRef,
		playerO: playerRef,
		state: gameStateValidator,
		winner: v.optional(v.union(v.literal("X"), v.literal("O"), v.literal("draw"))),
		currentTurnStartedAt: v.optional(v.number()),
		finishedAt: v.optional(v.number()),
	})
		.index("by_invite", ["inviteCode"])
		.index("by_status_mode", ["status", "mode"]),

	matchmakingQueue: defineTable({
		userId: playerRef,
		mode: v.literal("realtime"),
		joinedAt: v.number(),
	}).index("by_mode_time", ["mode", "joinedAt"]),
});
