"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback, useState } from "react";
import { api } from "@convex/_generated/api";

export function useRankedMatchmakingQueue() {
	const queueStatus = useQuery(api.rankedMatchmaking.queries.getMyStatus);
	const cancelQueue = useMutation(api.rankedMatchmaking.mutations.cancel);
	const [cancelling, setCancelling] = useState(false);

	const inQueue = queueStatus?.inQueue ?? false;

	const cancelSearch = useCallback(async () => {
		setCancelling(true);
		try {
			await cancelQueue({});
		} finally {
			setCancelling(false);
		}
	}, [cancelQueue]);

	return {
		inQueue,
		cancelSearch,
		cancelling,
		isLoading: queueStatus === undefined,
	};
}
