"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@convex/_generated/api";
import { getGuestId } from "@/lib/guest";

/** Redirect to a new realtime game when matchmaking pairs the player. */
export function MatchmakingQueueListener() {
	const router = useRouter();
	const guestId = getGuestId();
	const queueStatus = useQuery(api.matchmaking.queries.getMyStatus, { guestId });
	const rankedQueueStatus = useQuery(api.rankedMatchmaking.queries.getMyStatus);
	const activeGames = useQuery(api.games.queries.listMyActiveGames, { guestId });

	useEffect(() => {
		if (!activeGames) return;

		if (rankedQueueStatus?.inQueue) {
			const rankedMatch = activeGames.find(
				(g) => g.mode === "realtime" && g.status === "active" && g.isRanked,
			);
			if (rankedMatch) router.push(`/game/${rankedMatch.gameId}`);
			return;
		}

		if (!queueStatus?.inQueue) return;
		const match = activeGames.find(
			(g) => g.mode === "realtime" && g.status === "active" && !g.isRanked,
		);
		if (match) router.push(`/game/${match.gameId}`);
	}, [queueStatus?.inQueue, rankedQueueStatus?.inQueue, activeGames, router]);

	return null;
}
