"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback, useState } from "react";
import { api } from "@convex/_generated/api";
import { getGuestId } from "@/lib/guest";

export function useMatchmakingQueue() {
	const guestId = getGuestId();
	const queueStatus = useQuery(api.matchmaking.queries.getMyStatus, { guestId });
	const cancelQueue = useMutation(api.matchmaking.mutations.cancel);
	const [cancelling, setCancelling] = useState(false);

	const inQueue = queueStatus?.inQueue ?? false;

	const cancelSearch = useCallback(async () => {
		setCancelling(true);
		try {
			await cancelQueue({ guestId });
		} finally {
			setCancelling(false);
		}
	}, [cancelQueue, guestId]);

	return {
		inQueue,
		cancelSearch,
		cancelling,
		isLoading: queueStatus === undefined,
	};
}
