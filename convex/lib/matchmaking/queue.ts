import {
	casualQueueKindFromMode,
	type CasualMode,
	QUEUE_KINDS,
	type QueueKind,
	queueKindRequiresAuth,
	queueKindUsesRealtimeBlock,
} from "@shared/policy/queueKind";
import { pickMatchedRedirect } from "@shared/policy/matchRedirect";
import { DEFAULT_RATING } from "@shared/ratings/elo";
import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { findRankedOpponent } from "../../ratings/lib/matchmaking";
import { isUserId } from "../isUserId";
import { checkRealtimeBlocked, expireStaleQueueEntries, markQueueEntryMatched } from "./core";
import { createMatchedGame } from "./createMatchedGame";
import { findCasualOpponent } from "./pairCasual";

type Ctx = QueryCtx | MutationCtx;

export type QueueKindStatus = {
	inQueue: boolean;
	matchedGameId: Id<"games"> | null;
};

export type QueueStatusSnapshot = {
	casualRealtime: QueueKindStatus;
	casualAsync: QueueKindStatus;
	rankedRated: QueueKindStatus;
	inQueue: boolean;
	inQueueRealtime: boolean;
	inQueueAsync: boolean;
	matchedGameId: Id<"games"> | null;
};

export type EnqueueResult =
	| { matched: true; gameId: Id<"games"> }
	| {
			matched: false;
			inQueue?: true;
			blocked?: true;
			gameId?: Id<"games">;
			reason?: "already_in_active_realtime";
	  };

function emptyKindStatus(): QueueKindStatus {
	return { inQueue: false, matchedGameId: null };
}

function statusFromEntry(entry: Doc<"matchmakingQueue"> | null): QueueKindStatus {
	if (!entry) return emptyKindStatus();
	return {
		inQueue: !entry.matchedGameId,
		matchedGameId: entry.matchedGameId ?? null,
	};
}

export async function findMyQueueEntry(
	ctx: Ctx,
	queueKind: QueueKind,
	playerRef: Id<"users"> | string,
): Promise<Doc<"matchmakingQueue"> | null> {
	return await ctx.db
		.query("matchmakingQueue")
		.withIndex("by_kind_player", (q) =>
			q.eq("queueKind", queueKind).eq("playerRef", playerRef),
		)
		.unique();
}

export async function listQueueEntries(
	ctx: Ctx,
	queueKind: QueueKind,
): Promise<Doc<"matchmakingQueue">[]> {
	return await ctx.db
		.query("matchmakingQueue")
		.withIndex("by_kind_time", (q) => q.eq("queueKind", queueKind))
		.collect();
}

export async function getQueueStatus(
	ctx: Ctx,
	playerRef: Id<"users"> | string | null | undefined,
): Promise<QueueStatusSnapshot> {
	if (!playerRef) {
		const empty = emptyKindStatus();
		return {
			casualRealtime: empty,
			casualAsync: empty,
			rankedRated: empty,
			inQueue: false,
			inQueueRealtime: false,
			inQueueAsync: false,
			matchedGameId: null,
		};
	}

	const [casualRealtimeEntry, casualAsyncEntry, rankedRatedEntry] = await Promise.all(
		QUEUE_KINDS.map((queueKind) => findMyQueueEntry(ctx, queueKind, playerRef)),
	);

	const casualRealtime = statusFromEntry(casualRealtimeEntry);
	const casualAsync = statusFromEntry(casualAsyncEntry);
	const rankedRated = statusFromEntry(rankedRatedEntry);

	return {
		casualRealtime,
		casualAsync,
		rankedRated,
		inQueue: casualRealtime.inQueue || casualAsync.inQueue,
		inQueueRealtime: casualRealtime.inQueue,
		inQueueAsync: casualAsync.inQueue,
		matchedGameId: casualRealtime.matchedGameId ?? casualAsync.matchedGameId,
	};
}

export async function enqueueInQueue(
	ctx: MutationCtx,
	args: {
		queueKind: QueueKind;
		playerRef: Id<"users"> | string;
		ratingAtJoin?: number;
	},
): Promise<EnqueueResult> {
	const { queueKind, playerRef } = args;

	if (queueKindRequiresAuth(queueKind) && !isUserId(playerRef)) {
		throw new Error("Not authenticated");
	}

	if (queueKindUsesRealtimeBlock(queueKind)) {
		const blocked = await checkRealtimeBlocked(ctx, playerRef);
		if (blocked) {
			return { matched: false, ...blocked };
		}
	}

	const myEntry = await findMyQueueEntry(ctx, queueKind, playerRef);

	if (myEntry?.matchedGameId) {
		return { matched: true, gameId: myEntry.matchedGameId };
	}

	const now = Date.now();
	const entries = await listQueueEntries(ctx, queueKind);
	let opponent: Doc<"matchmakingQueue"> | null = null;

	if (queueKind === "ranked-rated") {
		const rating = args.ratingAtJoin ?? DEFAULT_RATING;
		const myJoinedAt = myEntry?.joinedAt ?? now;
		opponent = findRankedOpponent(
			entries,
			playerRef as Id<"users">,
			rating,
			myJoinedAt,
			now,
		);
	} else {
		opponent = findCasualOpponent(entries, playerRef);
	}

	if (opponent) {
		const gameId = await createMatchedGame(ctx, {
			queueKind,
			playerX: opponent.playerRef as Id<"users"> | string,
			playerO: playerRef,
		});
		await markQueueEntryMatched(ctx, opponent._id, gameId);
		if (myEntry) await ctx.db.delete(myEntry._id);
		return { matched: true, gameId };
	}

	if (myEntry) {
		return { matched: false, inQueue: true };
	}

	await ctx.db.insert("matchmakingQueue", {
		playerRef,
		queueKind,
		joinedAt: now,
		...(queueKind === "ranked-rated"
			? { ratingAtJoin: args.ratingAtJoin ?? DEFAULT_RATING }
			: {}),
	});

	return { matched: false };
}

export async function cancelInQueue(
	ctx: MutationCtx,
	playerRef: Id<"users"> | string,
	queueKinds?: QueueKind[],
): Promise<void> {
	const kinds = queueKinds ?? [...QUEUE_KINDS];

	for (const queueKind of kinds) {
		const entry = await findMyQueueEntry(ctx, queueKind, playerRef);
		if (entry) await ctx.db.delete(entry._id);
	}
}

export async function acknowledgeQueueMatch(
	ctx: MutationCtx,
	playerRef: Id<"users"> | string,
	queueKinds?: QueueKind[],
): Promise<void> {
	const kinds = queueKinds ?? [...QUEUE_KINDS];

	for (const queueKind of kinds) {
		const entry = await findMyQueueEntry(ctx, queueKind, playerRef);
		if (entry?.matchedGameId) await ctx.db.delete(entry._id);
	}
}

export async function expireAllStaleQueueEntries(ctx: MutationCtx): Promise<void> {
	for (const queueKind of QUEUE_KINDS) {
		const entries = await listQueueEntries(ctx, queueKind);
		await expireStaleQueueEntries(ctx, entries, async (entry) => {
			await ctx.db.delete(entry._id);
		});
	}
}

export function resolveQueueKinds(args: {
	queueKind?: QueueKind;
	mode?: CasualMode;
}): QueueKind[] {
	if (args.queueKind) return [args.queueKind];
	if (args.mode) return [casualQueueKindFromMode(args.mode)];
	return ["casual-realtime", "casual-async"];
}

export function firstMatchedGameId(status: QueueStatusSnapshot) {
	return pickMatchedRedirect(status);
}
