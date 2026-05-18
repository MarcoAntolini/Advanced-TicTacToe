import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { mutation } from "../_generated/server";
import { generateInviteCode, getOptionalUserId, isParticipant } from "../lib/auth";
import {
	applyMove,
	createInitialState,
	serializeGameState,
	type Player,
} from "../lib/game";

const ASYNC_TIMEOUT_MS = 72 * 60 * 60 * 1000;

function isUserId(ref: Id<"users"> | string | null): ref is Id<"users"> {
	return ref !== null && typeof ref === "string" && !ref.startsWith("guest_") && ref.length > 10;
}

async function updateStatsForUser(
	ctx: { db: { get: (id: Id<"users">) => Promise<{ stats: { wins: number; losses: number; draws: number; streak: number } } | null>; patch: (id: Id<"users">, data: { stats: { wins: number; losses: number; draws: number; streak: number } }) => Promise<void> } },
	userId: Id<"users">,
	result: "win" | "loss" | "draw",
) {
	const user = await ctx.db.get(userId);
	if (!user) return;
	const stats = { ...user.stats };
	if (result === "win") {
		stats.wins += 1;
		stats.streak += 1;
	} else if (result === "loss") {
		stats.losses += 1;
		stats.streak = 0;
	} else {
		stats.draws += 1;
		stats.streak = 0;
	}
	await ctx.db.patch(userId, { stats });
}

async function updateStats(
	ctx: { db: { get: (id: Id<"users">) => Promise<{ stats: { wins: number; losses: number; draws: number; streak: number } } | null>; patch: (id: Id<"users">, data: { stats: { wins: number; losses: number; draws: number; streak: number } }) => Promise<void> } },
	winner: "X" | "O" | "draw",
	playerX: Id<"users"> | string | null,
	playerO: Id<"users"> | string | null,
) {
	if (winner === "draw") {
		if (isUserId(playerX)) await updateStatsForUser(ctx, playerX, "draw");
		if (isUserId(playerO)) await updateStatsForUser(ctx, playerO, "draw");
		return;
	}
	const winnerId = winner === "X" ? playerX : playerO;
	const loserId = winner === "X" ? playerO : playerX;
	if (isUserId(winnerId)) await updateStatsForUser(ctx, winnerId, "win");
	if (isUserId(loserId)) await updateStatsForUser(ctx, loserId, "loss");
}

function resolvePlayerRef(
	userId: Id<"users"> | null,
	guestId: string | undefined,
): Id<"users"> | string {
	if (userId) return userId;
	if (guestId) return guestId;
	throw new Error("guestId or authentication required");
}

export const create = mutation({
	args: {
		mode: v.union(v.literal("local"), v.literal("realtime"), v.literal("async")),
		guestId: v.optional(v.string()),
		asPlayer: v.optional(v.union(v.literal("X"), v.literal("O"))),
	},
	handler: async (ctx, args) => {
		const userId = await getOptionalUserId(ctx);
		const playerRef = userId ?? args.guestId;
		if (!playerRef) throw new Error("guestId or authentication required");

		const asPlayer = args.asPlayer ?? "X";
		const initialState = serializeGameState(createInitialState());
		const inviteCode =
			args.mode === "realtime" || args.mode === "async" ? generateInviteCode() : undefined;

		const gameId = await ctx.db.insert("games", {
			mode: args.mode,
			status: args.mode === "local" ? "active" : "waiting",
			inviteCode,
			playerX: asPlayer === "X" ? playerRef : null,
			playerO: asPlayer === "O" ? playerRef : null,
			state: initialState,
			currentTurnStartedAt: Date.now(),
		});

		return { gameId, inviteCode };
	},
});

export const join = mutation({
	args: {
		gameId: v.id("games"),
		inviteCode: v.optional(v.string()),
		guestId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const game = await ctx.db.get(args.gameId);
		if (!game) throw new Error("Game not found");
		if (game.status !== "waiting") throw new Error("Game is not joinable");
		if (game.inviteCode && args.inviteCode !== game.inviteCode) {
			throw new Error("Invalid invite code");
		}

		const userId = await getOptionalUserId(ctx);
		const playerRef = userId ?? args.guestId;
		if (!playerRef) throw new Error("guestId or authentication required");

		if (game.playerX === playerRef || game.playerO === playerRef) {
			throw new Error("Already in game");
		}

		const slot = game.playerX === null ? "playerX" : game.playerO === null ? "playerO" : null;
		if (!slot) throw new Error("Game is full");

		await ctx.db.patch(args.gameId, {
			[slot]: playerRef,
			status: "active",
			currentTurnStartedAt: Date.now(),
		});

		return { ok: true };
	},
});

export const playMove = mutation({
	args: {
		gameId: v.id("games"),
		board: v.number(),
		cell: v.number(),
		guestId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const game = await ctx.db.get(args.gameId);
		if (!game) throw new Error("Game not found");
		if (game.status !== "active") throw new Error("Game is not active");

		const userId = await getOptionalUserId(ctx);
		if (
			!isParticipant(game, { userId, guestId: args.guestId }) &&
			game.mode !== "local"
		) {
			throw new Error("Not a participant");
		}

		const current = game.state.currentPlayer;
		const isX = game.playerX === userId || game.playerX === args.guestId;
		const isO = game.playerO === userId || game.playerO === args.guestId;

		if (game.mode !== "local") {
			if (current === "X" && !isX) throw new Error("Not your turn");
			if (current === "O" && !isO) throw new Error("Not your turn");
		}

		if (game.mode === "async" && game.currentTurnStartedAt) {
			const elapsed = Date.now() - game.currentTurnStartedAt;
			if (elapsed > ASYNC_TIMEOUT_MS) {
				const inactive = current === "X" ? "O" : "X";
				await ctx.db.patch(args.gameId, {
					status: "finished",
					winner: inactive,
					finishedAt: Date.now(),
				});
				throw new Error("Turn timed out");
			}
		}

		const nextState = applyMove(
			{
				...game.state,
				boards: game.state.boards.map((b) => [...b]),
				meta: [...game.state.meta],
				moves: [...game.state.moves],
			},
			args.board,
			args.cell,
		);

		const patch: {
			state: typeof game.state;
			status?: "finished";
			winner?: "X" | "O" | "draw";
			finishedAt?: number;
			currentTurnStartedAt: number;
		} = {
			state: serializeGameState(nextState),
			currentTurnStartedAt: Date.now(),
		};

		if (nextState.status !== "active") {
			patch.status = "finished";
			patch.finishedAt = Date.now();
			patch.winner =
				nextState.status === "won" && nextState.winner
					? nextState.winner
					: "draw";
			await ctx.db.patch(args.gameId, patch);
			await updateStats(ctx, patch.winner!, game.playerX, game.playerO);
		} else {
			await ctx.db.patch(args.gameId, patch);
		}

		return { state: patch.state };
	},
});

export const forfeit = mutation({
	args: {
		gameId: v.id("games"),
		guestId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const game = await ctx.db.get(args.gameId);
		if (!game) throw new Error("Game not found");
		if (game.status !== "active") throw new Error("Game is not active");

		const userId = await getOptionalUserId(ctx);
		if (!isParticipant(game, { userId, guestId: args.guestId })) {
			throw new Error("Not a participant");
		}

		const isX = game.playerX === userId || game.playerX === args.guestId;
		const winner: Player = isX ? "O" : "X";

		await ctx.db.patch(args.gameId, {
			status: "finished",
			winner,
			finishedAt: Date.now(),
		});

		await updateStats(ctx, winner, game.playerX, game.playerO);
	},
});

export const rematch = mutation({
	args: {
		gameId: v.id("games"),
		guestId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const game = await ctx.db.get(args.gameId);
		if (!game) throw new Error("Game not found");

		const userId = await getOptionalUserId(ctx);
		if (!isParticipant(game, { userId, guestId: args.guestId })) {
			throw new Error("Not a participant");
		}

		const inviteCode =
			game.mode === "realtime" || game.mode === "async"
				? generateInviteCode()
				: undefined;

		const gameId = await ctx.db.insert("games", {
			mode: game.mode,
			status: "active",
			inviteCode,
			playerX: game.playerX,
			playerO: game.playerO,
			state: serializeGameState(createInitialState()),
			currentTurnStartedAt: Date.now(),
		});

		return { gameId, inviteCode };
	},
});
