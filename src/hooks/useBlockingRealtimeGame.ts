"use client";

import { useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "@convex/_generated/api";
import { getGuestId } from "@/lib/guest";

/** Blocks starting another realtime match (waiting or active). Async games are allowed in parallel. */
export function useBlockingRealtimeGame() {
	const guestId = getGuestId();
	const activeGames = useQuery(api.games.queries.listMyActiveGames, { guestId });

	const blockingGame = useMemo(
		() => activeGames?.find((game) => game.mode === "realtime") ?? null,
		[activeGames],
	);

	return {
		blockingGame,
		blocked: blockingGame != null,
		isLoading: activeGames === undefined,
	};
}
