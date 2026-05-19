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
	const activeGames = useQuery(api.games.queries.listMyActiveGames, { guestId });

	useEffect(() => {
		if (!queueStatus?.inQueue || !activeGames) return;
		const match = activeGames.find(
			(g) => g.mode === "realtime" && g.status === "active",
		);
		if (match) router.push(`/game/${match.gameId}`);
	}, [queueStatus?.inQueue, activeGames, router]);

	return null;
}
