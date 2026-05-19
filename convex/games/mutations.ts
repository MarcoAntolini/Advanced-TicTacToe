import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { mutation } from "../_generated/server";
import { generateInviteCode, getOptionalUserId, isParticipant } from "../lib/auth";
import {
	assignSecondPlayer,
	findActiveRealtimeGame,
	findGameByInviteCode,
	findOtherActiveRealtime,
	isHost,
	resolvePlayerRef,
} from "../lib/room";
import { buildFinishedGamePatch } from "../lib/finishGame";
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

		if (args.mode === "realtime") {
			const active = await findActiveRealtimeGame(ctx, playerRef);
			if (active) {
				throw new Error("You already have an active realtime game. Resume it from My games.");
			}
		}

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

export const joinByInviteCode = mutation({
	args: {
		inviteCode: v.string(),
		guestId: v.optional(v.string()),
		forceLeaveActive: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const userId = await getOptionalUserId(ctx);
		const playerRef = resolvePlayerRef(userId, args.guestId);

		const game = await findGameByInviteCode(ctx, args.inviteCode);
		if (!game) throw new Error("Invalid invite code");

		if (isParticipant(game, { userId, guestId: args.guestId })) {
			return { result: "rejoin" as const, gameId: game._id };
		}

		if (game.mode === "realtime" && !args.forceLeaveActive) {
			const conflict = await findOtherActiveRealtime(ctx, playerRef, game._id);
			if (conflict) {
				return {
					result: "needs_confirm" as const,
					conflictGameId: conflict._id,
				};
			}
		}

		if (args.forceLeaveActive && game.mode === "realtime") {
			const conflict = await findOtherActiveRealtime(ctx, playerRef, game._id);
			if (conflict) {
				const forfeiterIsX =
					conflict.playerX === playerRef ||
					conflict.playerX === userId ||
					conflict.playerX === args.guestId;
				const winner: Player = forfeiterIsX ? "O" : "X";
				if (conflict.playerO && conflict.playerX) {
					await ctx.db.patch(
						conflict._id,
						buildFinishedGamePatch(conflict, winner),
					);
					await updateStats(ctx, winner, conflict.playerX, conflict.playerO);
				}
			}
		}

		const joined = await assignSecondPlayer(ctx, game._id, playerRef);
		return {
			result: joined.rejoin ? ("rejoin" as const) : ("joined" as const),
			gameId: joined.gameId,
		};
	},
});

export const cancelRoom = mutation({
	args: {
		gameId: v.id("games"),
		guestId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const game = await ctx.db.get(args.gameId);
		if (!game) throw new Error("Game not found");
		if (game.status !== "waiting") throw new Error("Only waiting rooms can be cancelled");

		const userId = await getOptionalUserId(ctx);
		const playerRef = resolvePlayerRef(userId, args.guestId);

		if (!(await isHost(ctx, game, playerRef))) {
			throw new Error("Only the host can cancel this room");
		}

		await ctx.db.delete(args.gameId);
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
				await ctx.db.patch(
					args.gameId,
					buildFinishedGamePatch(game, inactive),
				);
				await updateStats(ctx, inactive, game.playerX, game.playerO);
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

		await ctx.db.patch(args.gameId, buildFinishedGamePatch(game, winner));
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
