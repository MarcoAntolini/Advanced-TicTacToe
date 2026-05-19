import { v } from "convex/values";

export const playerValidator = v.union(v.literal("X"), v.literal("O"));

export const gameStatusValidator = v.union(
	v.literal("active"),
	v.literal("won"),
	v.literal("draw"),
);

export const gameStateValidator = v.object({
	boards: v.array(v.array(v.union(playerValidator, v.null()))),
	meta: v.array(v.union(playerValidator, v.null())),
	currentPlayer: playerValidator,
	activeBoard: v.union(v.number(), v.null()),
	status: v.union(v.literal("active"), v.literal("won"), v.literal("draw")),
	winner: v.union(playerValidator, v.null()),
	lastMove: v.optional(
		v.object({
			board: v.number(),
			cell: v.number(),
		}),
	),
	moves: v.array(
		v.object({
			board: v.number(),
			cell: v.number(),
			player: playerValidator,
		}),
	),
});

export const statsValidator = v.object({
	wins: v.number(),
	losses: v.number(),
	draws: v.number(),
	streak: v.number(),
});

export const queueKindValidator = v.union(
	v.literal("casual-realtime"),
	v.literal("casual-async"),
	v.literal("ranked-rated"),
);
