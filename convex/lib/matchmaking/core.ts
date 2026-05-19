import type { Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { findActiveRealtimeGame } from "../participation";

type Ctx = QueryCtx | MutationCtx;

export const MATCHMAKING_STALE_MS = 60 * 1000;

export type RealtimeBlockResult = {
	blocked: true;
	gameId: Id<"games">;
	reason: "already_in_active_realtime";
};

export async function checkRealtimeBlocked(
	ctx: Ctx,
	playerRef: Id<"users"> | string,
): Promise<RealtimeBlockResult | null> {
	const activeGame = await findActiveRealtimeGame(ctx, playerRef);
	if (!activeGame) return null;
	return {
		blocked: true,
		gameId: activeGame._id,
		reason: "already_in_active_realtime",
	};
}

export async function expireStaleQueueEntries<T extends { joinedAt: number }>(
	ctx: MutationCtx,
	entries: T[],
	deleteEntry: (entry: T) => Promise<void>,
) {
	const now = Date.now();
	for (const entry of entries) {
		if (now - entry.joinedAt > MATCHMAKING_STALE_MS) {
			await deleteEntry(entry);
		}
	}
}

export async function markQueueEntryMatched(
	ctx: MutationCtx,
	entryId: Id<"matchmakingQueue">,
	gameId: Id<"games">,
) {
	await ctx.db.patch(entryId, { matchedGameId: gameId });
}
