import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

type GameStatus = Doc<"games">["status"];
type PlayerSlot = "playerX" | "playerO";

const ACTIVE_STATUSES: GameStatus[] = ["waiting", "active"];

async function gamesForPlayerSlot(
	ctx: Ctx,
	playerRef: Id<"users"> | string,
	slot: PlayerSlot,
	status: GameStatus,
): Promise<Doc<"games">[]> {
	const index = slot === "playerX" ? "by_playerX_status" : "by_playerO_status";
	return await ctx.db
		.query("games")
		.withIndex(index, (q) => q.eq(slot, playerRef).eq("status", status))
		.collect();
}

async function gamesForPlayer(ctx: Ctx, playerRef: Id<"users"> | string, status: GameStatus) {
	const [asX, asO] = await Promise.all([
		gamesForPlayerSlot(ctx, playerRef, "playerX", status),
		gamesForPlayerSlot(ctx, playerRef, "playerO", status),
	]);
	const seen = new Set<string>();
	return [...asX, ...asO].filter((game) => {
		if (seen.has(game._id)) return false;
		seen.add(game._id);
		return true;
	});
}

/** Active or waiting games for a participant (excludes local). */
export async function listParticipatingGames(
	ctx: Ctx,
	playerRef: Id<"users"> | string,
): Promise<Doc<"games">[]> {
	const batches = await Promise.all(
		ACTIVE_STATUSES.map((status) => gamesForPlayer(ctx, playerRef, status)),
	);
	const seen = new Set<string>();
	const games: Doc<"games">[] = [];
	for (const batch of batches) {
		for (const game of batch) {
			if (game.mode === "local" || seen.has(game._id)) continue;
			seen.add(game._id);
			games.push(game);
		}
	}
	return games;
}

/** One active **realtime** game per participant (waiting or active). */
export async function findActiveRealtimeGame(
	ctx: Ctx,
	playerRef: Id<"users"> | string,
	excludeGameId?: Id<"games">,
): Promise<Doc<"games"> | null> {
	for (const status of ACTIVE_STATUSES) {
		const games = await gamesForPlayer(ctx, playerRef, status);
		const match = games.find(
			(game) =>
				game.mode === "realtime" &&
				(!excludeGameId || game._id !== excludeGameId),
		);
		if (match) return match;
	}
	return null;
}

export async function findOtherActiveRealtime(
	ctx: Ctx,
	playerRef: Id<"users"> | string,
	excludeGameId: Id<"games">,
): Promise<Doc<"games"> | null> {
	return findActiveRealtimeGame(ctx, playerRef, excludeGameId);
}

/** All games where guest id occupies a player slot (any status). */
export async function listGamesForGuestId(
	ctx: Ctx,
	guestId: string,
): Promise<Doc<"games">[]> {
	const statuses: GameStatus[] = ["waiting", "active", "finished"];
	const seen = new Set<string>();
	const games: Doc<"games">[] = [];

	for (const status of statuses) {
		for (const slot of ["playerX", "playerO"] as const) {
			const rows = await gamesForPlayerSlot(ctx, guestId, slot, status);
			for (const game of rows) {
				if (seen.has(game._id)) continue;
				seen.add(game._id);
				games.push(game);
			}
		}
	}

	return games;
}
