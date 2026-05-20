"use client";

import { useMatchmakingContext } from "@/components/layout/MatchmakingContext";

export function useMatchmakingQueue() {
	const {
		status: queueStatus,
		inQueue,
		inQueueRealtime,
		inQueueAsync,
		cancelSearch,
		cancelling,
		isLoading,
	} = useMatchmakingContext();

	return {
		inQueue,
		inQueueRealtime,
		inQueueAsync,
		cancelSearch,
		cancelling,
		isLoading,
		status: queueStatus,
	};
}

export function useRankedMatchmakingQueue() {
	const {
		rankedInQueue: inQueue,
		rankedMatchedGameId: matchedGameId,
		cancelRankedSearch: cancelSearch,
		cancelling,
		isLoading,
	} = useMatchmakingContext();

	return {
		inQueue,
		matchedGameId,
		cancelSearch,
		cancelling,
		isLoading,
	};
}

/** Unified read surface for all matchmaking queue kinds. */
export function useMatchmakingQueues() {
	const {
		status,
		matchedRedirect,
		inAnyQueue,
		cancelAll,
		cancelling,
		isLoading,
	} = useMatchmakingContext();

	return {
		status,
		matchedRedirect,
		inAnyQueue,
		cancelAll,
		cancelling,
		isLoading,
	};
}
