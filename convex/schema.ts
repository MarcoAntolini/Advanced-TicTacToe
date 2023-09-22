import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	games: defineTable({
		player: v.string(),
		opponent: v.string(),
	}),
});
