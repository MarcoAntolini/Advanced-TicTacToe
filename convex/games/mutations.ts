import { v } from "convex/values";
import { rankedClockFields } from "@shared/clock/rankedDefaults";
import { isAsyncTurnExpired } from "@shared/policy/asyncTurn";
import { createFieldsForPracticeRanked, rematchClassificationFields } from "@shared/policy/gameClassification";
import { canMoveAs, isParticipant, participantSide } from "@shared/policy/participant";
import { mutation } from "../_generated/server";
import {
	enforceRankedClockBeforeMove,
	forfeitRankedClocks,
	rankedClockPatchAfterMove,
} from "../clock/lib/enforce";
import { RANKED_INCREMENT_MS } from "../clock/lib/constants";
import { generateInviteCode, getOptionalUserId } from "../lib/auth";
import { endGame } from "../lib/endGame";
import { joinWaitingGame } from "../lib/joinWaitingGame";
import { findActiveRealtimeGame, findGameByInviteCode, isHost } from "../lib/room";
import { participantIdentity, resolveParticipant } from "../lib/participant";
import {
	applyMove,
	createInitialState,
	serializeGameState,
	type Player,
} from "../lib/game";

export const create = mutation({
	args: {
		mode: v.union(v.literal("local"), v.literal("realtime"), v.literal("async")),
		guestId: v.optional(v.string()),
		asPlayer: v.optional(v.union(v.literal("X"), v.literal("O"))),
		visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
		rankedRules: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const userId = await getOptionalUserId(ctx);
		const playerRef = userId ?? args.guestId;
		if (!playerRef) throw new Error("guestId or authentication required");

		if (args.mode === "realtime") {
			const active = await findActiveRealtimeGame(ctx, playerRef);
			if (active) {
				throw new Error(
					"You already have an active realtime game. Resume it from Continue playing above.",
				);
			}
		}

		const asPlayer = args.asPlayer ?? "X";
		const initialState = serializeGameState(createInitialState());
		const inviteCode =
			args.mode === "realtime" || args.mode === "async"
				? generateInviteCode()
				: undefined;

		const visibility =
			args.mode === "local" ? undefined : (args.visibility ?? "private");

		const useRankedRules = args.mode === "realtime" && args.rankedRules === true;

		const gameId = await ctx.db.insert("games", {
			mode: args.mode,
			status: args.mode === "local" ? "active" : "waiting",
			inviteCode,
			visibility,
			playerX: asPlayer === "X" ? playerRef : null,
			playerO: asPlayer === "O" ? playerRef : null,
			state: initialState,
			currentTurnStartedAt: Date.now(),
			...(useRankedRules ? createFieldsForPracticeRanked(rankedClockFields()) : {}),
		});

		return { gameId, inviteCode };
	},
});

export const joinPublicGame = mutation({
	args: {
		gameId: v.id("games"),
		guestId: v.optional(v.string()),
		forceLeaveActive: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const participant = await resolveParticipant(ctx, args.guestId);
		const game = await ctx.db.get(args.gameId);
		if (!game) throw new Error("Game not found");
		if (game.visibility !== "public") {
			throw new Error("This game is not open in the public lobby");
		}
		if (game.status !== "waiting") {
			throw new Error("This game is no longer waiting for a player");
		}

		return joinWaitingGame(ctx, game, participant, {
			forceLeaveActive: args.forceLeaveActive,
		});
	},
});

export const joinByInviteCode = mutation({
	args: {
		inviteCode: v.string(),
		guestId: v.optional(v.string()),
		forceLeaveActive: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const participant = await resolveParticipant(ctx, args.guestId);
		const game = await findGameByInviteCode(ctx, args.inviteCode);
		if (!game) throw new Error("Invalid invite code");

		return joinWaitingGame(ctx, game, participant, {
			forceLeaveActive: args.forceLeaveActive,
		});
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

		const participant = await resolveParticipant(ctx, args.guestId);
		if (!(await isHost(ctx, game, participant.playerRef))) {
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

		const participant = await resolveParticipant(ctx, args.guestId);
		const identity = participantIdentity(participant);

		if (!isParticipant(game, identity) && game.mode !== "local") {
			throw new Error("Not a participant");
		}

		const current = game.state.currentPlayer;
		if (game.mode !== "local" && !canMoveAs(game, identity, current)) {
			throw new Error("Not your turn");
		}

		const clockCheck = await enforceRankedClockBeforeMove(ctx, game);
		if (clockCheck.timedOut) {
			throw new Error("Turn timed out");
		}

		if (game.mode === "async" && isAsyncTurnExpired(game.currentTurnStartedAt, Date.now())) {
			const inactive = current === "X" ? "O" : "X";
			await endGame(ctx, game, inactive);
			throw new Error("Turn timed out");
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

		const mover = current;

		if (nextState.status !== "active") {
			const winner =
				nextState.status === "won" && nextState.winner ? nextState.winner : "draw";
			await endGame(ctx, game, winner, {
				state: serializeGameState(nextState),
				...clockCheck.clockPatch,
			});
		} else {
			const activePatch: Record<string, unknown> = {
				state: serializeGameState(nextState),
				currentTurnStartedAt: Date.now(),
			};
			if (game.isRanked) {
				Object.assign(
					activePatch,
					rankedClockPatchAfterMove(
						game,
						mover,
						clockCheck.clockPatch.clockXMs ?? game.clockXMs ?? 0,
						clockCheck.clockPatch.clockOMs ?? game.clockOMs ?? 0,
					),
				);
			}
			await ctx.db.patch(args.gameId, activePatch);
		}

		return { state: serializeGameState(nextState) };
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

		const participant = await resolveParticipant(ctx, args.guestId);
		if (!isParticipant(game, participantIdentity(participant))) {
			throw new Error("Not a participant");
		}

		const side = participantSide(game, participantIdentity(participant));
		if (!side) throw new Error("Not a participant");
		const winner: Player = side === "X" ? "O" : "X";
		const clockPatch = await forfeitRankedClocks(ctx, game);

		await endGame(ctx, game, winner, clockPatch);
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

		const participant = await resolveParticipant(ctx, args.guestId);
		if (!isParticipant(game, participantIdentity(participant))) {
			throw new Error("Not a participant");
		}

		const inviteCode =
			game.mode === "realtime" || game.mode === "async"
				? generateInviteCode()
				: undefined;

		const now = Date.now();
		const classificationFields = rematchClassificationFields(game);
		const isRanked = game.isRanked === true;

		const gameId = await ctx.db.insert("games", {
			mode: game.mode,
			...classificationFields,
			status: "active",
			inviteCode,
			playerX: game.playerX,
			playerO: game.playerO,
			state: serializeGameState(createInitialState()),
			currentTurnStartedAt: now,
			...(isRanked
				? {
						...rankedClockFields(),
						clockIncrementMs: game.clockIncrementMs ?? RANKED_INCREMENT_MS,
					}
				: {}),
		});

		return { gameId, inviteCode };
	},
});
