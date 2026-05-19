"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback, useState } from "react";
import { pickMatchedRedirect } from "@shared/policy/matchRedirect";
import { api } from "@convex/_generated/api";
import { getGuestId } from "@/lib/guest";

export function useMatchmakingQueue() {
	const guestId = getGuestId();
	const queueStatus = useQuery(api.matchmaking.queries.getMyStatus, { guestId });
	const cancelQueue = useMutation(api.matchmaking.mutations.cancel);
	const [cancelling, setCancelling] = useState(false);

	const inQueueRealtime = queueStatus?.inQueueRealtime ?? false;
	const inQueueAsync = queueStatus?.inQueueAsync ?? false;
	const inQueue = queueStatus?.inQueue ?? false;

	const cancelSearch = useCallback(
		async (mode?: "realtime" | "async") => {
			setCancelling(true);
			try {
				await cancelQueue({ guestId, mode });
			} finally {
				setCancelling(false);
			}
		},
		[cancelQueue, guestId],
	);

	return {
		inQueue,
		inQueueRealtime,
		inQueueAsync,
		cancelSearch,
		cancelling,
		isLoading: queueStatus === undefined,
		status: queueStatus,
	};
}

export function useRankedMatchmakingQueue() {
	const guestId = getGuestId();
	const queueStatus = useQuery(api.matchmaking.queries.getMyStatus, { guestId });
	const cancelQueue = useMutation(api.matchmaking.mutations.cancel);
	const [cancelling, setCancelling] = useState(false);

	const inQueue = queueStatus?.rankedRated.inQueue ?? false;
	const matchedGameId = queueStatus?.rankedRated.matchedGameId ?? null;

	const cancelSearch = useCallback(async () => {
		setCancelling(true);
		try {
			await cancelQueue({ guestId, queueKind: "ranked-rated" });
		} finally {
			setCancelling(false);
		}
	}, [cancelQueue, guestId]);

	return {
		inQueue,
		matchedGameId,
		cancelSearch,
		cancelling,
		isLoading: queueStatus === undefined,
	};
}

/** Unified read surface for all matchmaking queue kinds. */
export function useMatchmakingQueues() {
	const guestId = getGuestId();
	const status = useQuery(api.matchmaking.queries.getMyStatus, { guestId });
	const cancelQueue = useMutation(api.matchmaking.mutations.cancel);
	const [cancelling, setCancelling] = useState(false);

	const cancelAll = useCallback(async () => {
		setCancelling(true);
		try {
			const tasks: Promise<unknown>[] = [];
			if (status?.inQueue) tasks.push(cancelQueue({ guestId }));
			if (status?.rankedRated.inQueue) {
				tasks.push(cancelQueue({ guestId, queueKind: "ranked-rated" }));
			}
			await Promise.all(tasks);
		} finally {
			setCancelling(false);
		}
	}, [cancelQueue, guestId, status?.inQueue, status?.rankedRated.inQueue]);

	const matchedRedirect = status ? pickMatchedRedirect(status) : null;

	return {
		status,
		matchedRedirect,
		inAnyQueue:
			(status?.inQueue ?? false) || (status?.rankedRated.inQueue ?? false),
		cancelAll,
		cancelling,
		isLoading: status === undefined,
	};
}
