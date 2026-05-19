import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { classifyGame, gameDisplayMode, lobbyListingFields } from "@shared/policy/gameClassification";
import { query } from "../_generated/server";
import { getOptionalUserId, isParticipant } from "../lib/auth";
import {
	findGameByInviteCode,
	isHost,
	listGamesForPlayer,
	normalizeInviteCode,
	resolvePlayerRef,
} from "../lib/room";
import { listHistoryForUser } from "../lib/gameHistory";

export const get = query({
	args: { gameId: v.id("games") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.gameId);
	},
});

export const getRoomByCode = query({
	args: {
		inviteCode: v.string(),
		guestId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const code = normalizeInviteCode(args.inviteCode);
		if (!code) return null;

		const game = await findGameByInviteCode(ctx, code);
		if (!game) return null;

		const userId = await getOptionalUserId(ctx);
		let playerRef: ReturnType<typeof resolvePlayerRef> | null = null;
		try {
			playerRef = resolvePlayerRef(userId, args.guestId);
		} catch {
			playerRef = null;
		}

		const participant = playerRef
			? isParticipant(game, { userId, guestId: args.guestId })
			: false;

		return {
			gameId: game._id,
			inviteCode: game.inviteCode,
			mode: game.mode,
			status: game.status,
			canJoin: game.status === "waiting",
			isParticipant: participant,
			isHost: playerRef ? await isHost(ctx, game, playerRef) : false,
		};
	},
});

export const listHistory = query({
	args: { paginationOpts: paginationOptsValidator },
	handler: async (ctx, args) => {
		const userId = await getOptionalUserId(ctx);
		if (!userId) return { page: [], isDone: true, continueCursor: "" };

		return listHistoryForUser(ctx, userId, {
			numItems: args.paginationOpts.numItems,
			cursor: args.paginationOpts.cursor,
		});
	},
});

const PUBLIC_LOBBY_LIMIT = 20;

export const listPublicWaitingGames = query({
	args: {
		guestId: v.optional(v.string()),
		mode: v.optional(v.union(v.literal("realtime"), v.literal("async"))),
	},
	handler: async (ctx, args) => {
		const userId = await getOptionalUserId(ctx);
		const playerRef = userId ?? args.guestId;

		const rows = await ctx.db
			.query("games")
			.withIndex("by_status_visibility_mode", (q) =>
				q.eq("status", "waiting").eq("visibility", "public"),
			)
			.order("desc")
			.take(50);

		const open = rows.filter((game) => {
			if (game.mode === "local") return false;
			if (args.mode && game.mode !== args.mode) return false;
			if (game.playerO !== null) return false;
			if (playerRef && game.playerX === playerRef) return false;
			return true;
		});

		return open.slice(0, PUBLIC_LOBBY_LIMIT).map((game) => ({
			gameId: game._id,
			mode: game.mode,
			...lobbyListingFields(game),
			inviteCode: game.inviteCode,
			createdAt: game._creationTime,
		}));
	},
});

export const listMyActiveGames = query({
	args: { guestId: v.optional(v.string()) },
	handler: async (ctx, args) => {
		const userId = await getOptionalUserId(ctx);
		const playerRef = userId ?? args.guestId;
		if (!playerRef) return [];

		const games = await listGamesForPlayer(ctx, playerRef);

		return games.map((game) => {
			const isX = game.playerX === playerRef;
			const isO = game.playerO === playerRef;
			const yourRole = isX ? "X" : isO ? "O" : null;
			const isYourTurn =
				game.status === "active" &&
				yourRole !== null &&
				game.state.currentPlayer === yourRole;

			let statusLabel: string;
			if (game.status === "waiting") {
				statusLabel = isX ? "Waiting for opponent" : "Waiting to start";
			} else if (isYourTurn) {
				statusLabel = "Your turn";
			} else {
				statusLabel = "In progress";
			}

			return {
				gameId: game._id,
				mode: game.mode,
				classification: classifyGame(game),
				displayMode: gameDisplayMode(game),
				isRanked: game.isRanked === true,
				status: game.status,
				inviteCode: game.inviteCode,
				yourRole,
				isYourTurn,
				statusLabel,
			};
		});
	},
});

export const listMyTurns = query({
	args: { guestId: v.optional(v.string()) },
	handler: async (ctx, args) => {
		const userId = await getOptionalUserId(ctx);
		const playerRef = userId ?? args.guestId;
		if (!playerRef) return [];

		const games = await listGamesForPlayer(ctx, playerRef);
		return games.filter((game) => {
			if (game.mode !== "async" || game.status !== "active") return false;
			const isX = game.playerX === playerRef;
			const isO = game.playerO === playerRef;
			return (
				(game.state.currentPlayer === "X" && isX) ||
				(game.state.currentPlayer === "O" && isO)
			);
		});
	},
});
