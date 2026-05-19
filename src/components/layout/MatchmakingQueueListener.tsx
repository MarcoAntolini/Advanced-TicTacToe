"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { api } from "@convex/_generated/api";
import { getGuestId } from "@/lib/guest";
import { useMatchmakingQueues } from "@/hooks/useMatchmakingQueue";

/** Redirect when unified matchmaking sets matchedGameId on a queue row. */
export function MatchmakingQueueListener() {
	const router = useRouter();
	const guestId = getGuestId();
	const { status, matchedRedirect } = useMatchmakingQueues();
	const acknowledgeMatch = useMutation(api.matchmaking.mutations.acknowledgeMatch);
	const redirectedRef = useRef<string | null>(null);

	useEffect(() => {
		if (!status || !matchedRedirect) return;
		if (redirectedRef.current === matchedRedirect.gameId) return;

		redirectedRef.current = matchedRedirect.gameId;
		router.push(`/game/${matchedRedirect.gameId}`);
		void acknowledgeMatch({
			guestId,
			queueKind: matchedRedirect.queueKind,
		});
	}, [status, matchedRedirect, router, guestId, acknowledgeMatch]);

	return null;
}
