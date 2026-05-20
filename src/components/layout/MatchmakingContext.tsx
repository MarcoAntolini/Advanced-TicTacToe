"use client";

import { useMutation, useQuery } from "convex/react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { FunctionReturnType } from "convex/server";
import { pickMatchedRedirect } from "@shared/policy/matchRedirect";
import { api } from "@convex/_generated/api";
import { getGuestId } from "@/lib/guest";

type QueueStatus = FunctionReturnType<typeof api.matchmaking.queries.getMyStatus>;

type MatchmakingContextValue = {
	status: QueueStatus | undefined;
	isLoading: boolean;
	matchedRedirect: ReturnType<typeof pickMatchedRedirect>;
	inAnyQueue: boolean;
	inQueue: boolean;
	inQueueRealtime: boolean;
	inQueueAsync: boolean;
	rankedInQueue: boolean;
	rankedMatchedGameId: string | null;
	cancelSearch: (mode?: "realtime" | "async") => Promise<void>;
	cancelRankedSearch: () => Promise<void>;
	cancelAll: () => Promise<void>;
	cancelling: boolean;
};

const MatchmakingContext = createContext<MatchmakingContextValue | null>(null);

export function MatchmakingProvider({ children }: { children: ReactNode }) {
	const guestId = getGuestId();
	const status = useQuery(api.matchmaking.queries.getMyStatus, { guestId });
	const cancelQueue = useMutation(api.matchmaking.mutations.cancel);
	const [cancelling, setCancelling] = useState(false);

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

	const cancelRankedSearch = useCallback(async () => {
		setCancelling(true);
		try {
			await cancelQueue({ guestId, queueKind: "ranked-rated" });
		} finally {
			setCancelling(false);
		}
	}, [cancelQueue, guestId]);

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

	const value = useMemo<MatchmakingContextValue>(
		() => ({
			status,
			isLoading: status === undefined,
			matchedRedirect: status ? pickMatchedRedirect(status) : null,
			inAnyQueue: (status?.inQueue ?? false) || (status?.rankedRated.inQueue ?? false),
			inQueue: status?.inQueue ?? false,
			inQueueRealtime: status?.inQueueRealtime ?? false,
			inQueueAsync: status?.inQueueAsync ?? false,
			rankedInQueue: status?.rankedRated.inQueue ?? false,
			rankedMatchedGameId: status?.rankedRated.matchedGameId ?? null,
			cancelSearch,
			cancelRankedSearch,
			cancelAll,
			cancelling,
		}),
		[status, cancelSearch, cancelRankedSearch, cancelAll, cancelling],
	);

	return (
		<MatchmakingContext.Provider value={value}>{children}</MatchmakingContext.Provider>
	);
}

export function useMatchmakingContext() {
	const ctx = useContext(MatchmakingContext);
	if (!ctx) {
		throw new Error("useMatchmakingContext must be used within MatchmakingProvider");
	}
	return ctx;
}
