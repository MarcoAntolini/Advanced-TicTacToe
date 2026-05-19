import { normalizeInviteCode as normalizeInviteCodeShared } from "@shared/invite/normalize";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { listParticipatingGames } from "./participation";

type Ctx = QueryCtx | MutationCtx;

export {
	findActiveRealtimeGame,
	findOtherActiveRealtime,
} from "./participation";

export function normalizeInviteCode(code: string): string {
	return normalizeInviteCodeShared(code);
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

export async function listGamesForPlayer(ctx: Ctx, playerRef: Id<"users"> | string) {
	return listParticipatingGames(ctx, playerRef);
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
