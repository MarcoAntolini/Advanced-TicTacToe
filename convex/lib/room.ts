import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getOptionalUserId } from "./auth";

type Ctx = QueryCtx | MutationCtx;

export function normalizeInviteCode(code: string): string {
	return code.trim().toUpperCase().replace(/\s/g, "");
}

export function resolvePlayerRef(
	userId: Id<"users"> | null,
	guestId: string | undefined,
): Id<"users"> | string {
	if (userId) return userId;
	if (guestId) return guestId;
	throw new Error("guestId or authentication required");
}

export async function findGameByInviteCode(ctx: Ctx, inviteCode: string) {
	const code = normalizeInviteCode(inviteCode);
	if (code.length < 4) return null;
	return await ctx.db
		.query("games")
		.withIndex("by_invite", (q) => q.eq("inviteCode", code))
		.unique();
}

export async function findActiveRealtimeGame(
	ctx: Ctx,
	playerRef: Id<"users"> | string,
	excludeGameId?: Id<"games">,
) {
	const waiting = await ctx.db
		.query("games")
		.filter((q) =>
			q.and(q.eq(q.field("status"), "waiting"), q.eq(q.field("mode"), "realtime")),
		)
		.collect();

	const active = await ctx.db
		.query("games")
		.withIndex("by_status_mode", (q) => q.eq("status", "active").eq("mode", "realtime"))
		.collect();

	const games = [...waiting, ...active];
	return (
		games.find(
			(g) =>
				(!excludeGameId || g._id !== excludeGameId) &&
				(g.playerX === playerRef || g.playerO === playerRef),
		) ?? null
	);
}

export async function findOtherActiveRealtime(
	ctx: Ctx,
	playerRef: Id<"users"> | string,
	excludeGameId: Id<"games">,
) {
	return findActiveRealtimeGame(ctx, playerRef, excludeGameId);
}

export async function listGamesForPlayer(ctx: Ctx, playerRef: Id<"users"> | string) {
	const waiting = await ctx.db
		.query("games")
		.filter((q) => q.eq(q.field("status"), "waiting"))
		.collect();

	const activeRealtime = await ctx.db
		.query("games")
		.withIndex("by_status_mode", (q) => q.eq("status", "active").eq("mode", "realtime"))
		.collect();

	const activeAsync = await ctx.db
		.query("games")
		.withIndex("by_status_mode", (q) => q.eq("status", "active").eq("mode", "async"))
		.collect();

	const seen = new Set<string>();
	const games = [...waiting, ...activeRealtime, ...activeAsync].filter((g) => {
		if (seen.has(g._id)) return false;
		seen.add(g._id);
		return g.playerX === playerRef || g.playerO === playerRef;
	});

	return games;
}

export async function assignSecondPlayer(
	ctx: MutationCtx,
	gameId: Id<"games">,
	playerRef: Id<"users"> | string,
) {
	const game = await ctx.db.get(gameId);
	if (!game) throw new Error("Game not found");

	if (game.playerX === playerRef || game.playerO === playerRef) {
		return { gameId, rejoin: true as const };
	}

	if (game.status !== "waiting") {
		throw new Error("This game is no longer accepting players");
	}

	const slot = game.playerX === null ? "playerX" : game.playerO === null ? "playerO" : null;
	if (!slot) throw new Error("This game is full");

	await ctx.db.patch(gameId, {
		[slot]: playerRef,
		status: "active",
		currentTurnStartedAt: Date.now(),
	});

	return { gameId, rejoin: false as const };
}

export async function isHost(
	ctx: Ctx,
	game: { playerX: Id<"users"> | string | null },
	playerRef: Id<"users"> | string,
) {
	return game.playerX === playerRef;
}
