import { v } from "convex/values";

import type { Id } from "../_generated/dataModel";

import { mutation } from "../_generated/server";

import {

	enforceRankedClockBeforeMove,

	forfeitRankedClocks,

	rankedClockPatchAfterMove,

} from "../clock/lib/enforce";

import { RANKED_INCREMENT_MS, RANKED_INITIAL_MS } from "../clock/lib/constants";

import { generateInviteCode, getOptionalUserId, isParticipant } from "../lib/auth";

import { buildFinishedGamePatch } from "../lib/finishGame";

import { finishSideEffects } from "../lib/finishSideEffects";

import {

	assignSecondPlayer,

	findActiveRealtimeGame,

	findGameByInviteCode,

	findOtherActiveRealtime,

	isHost,

	resolvePlayerRef,

} from "../lib/room";

import {

	applyMove,

	createInitialState,

	serializeGameState,

	type Player,

} from "../lib/game";



const ASYNC_TIMEOUT_MS = 72 * 60 * 60 * 1000;



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

					await finishSideEffects(ctx, conflict, winner);

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



		const clockCheck = await enforceRankedClockBeforeMove(ctx, game);

		if (clockCheck.timedOut) {

			throw new Error("Turn timed out");

		}



		if (game.mode === "async" && game.currentTurnStartedAt) {

			const elapsed = Date.now() - game.currentTurnStartedAt;

			if (elapsed > ASYNC_TIMEOUT_MS) {

				const inactive = current === "X" ? "O" : "X";

				await ctx.db.patch(args.gameId, buildFinishedGamePatch(game, inactive));

				await finishSideEffects(ctx, game, inactive);

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



		const mover = current;



		if (nextState.status !== "active") {

			const winner =

				nextState.status === "won" && nextState.winner ? nextState.winner : "draw";

			await ctx.db.patch(args.gameId, {

				...buildFinishedGamePatch(game, winner),

				state: serializeGameState(nextState),

				...clockCheck.clockPatch,

			});

			await finishSideEffects(ctx, game, winner);

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



		const userId = await getOptionalUserId(ctx);

		if (!isParticipant(game, { userId, guestId: args.guestId })) {

			throw new Error("Not a participant");

		}



		const isX = game.playerX === userId || game.playerX === args.guestId;

		const winner: Player = isX ? "O" : "X";

		const clockPatch = await forfeitRankedClocks(ctx, game);



		await ctx.db.patch(args.gameId, {

			...buildFinishedGamePatch(game, winner),

			...clockPatch,

		});

		await finishSideEffects(ctx, game, winner);

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



		const now = Date.now();

		const isRanked = game.isRanked === true;



		const gameId = await ctx.db.insert("games", {

			mode: game.mode,

			isRanked: isRanked || undefined,

			status: "active",

			inviteCode,

			playerX: game.playerX,

			playerO: game.playerO,

			state: serializeGameState(createInitialState()),

			currentTurnStartedAt: now,

			...(isRanked

				? {

						clockXMs: RANKED_INITIAL_MS,

						clockOMs: RANKED_INITIAL_MS,

						clockIncrementMs: game.clockIncrementMs ?? RANKED_INCREMENT_MS,

					}

				: {}),

		});



		return { gameId, inviteCode };

	},

});

