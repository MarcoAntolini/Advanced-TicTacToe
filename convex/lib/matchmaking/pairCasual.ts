import type { Doc } from "../../_generated/dataModel";

export function findCasualOpponent(
	entries: Doc<"matchmakingQueue">[],
	playerRef: string,
): Doc<"matchmakingQueue"> | null {
	return entries.find((e) => e.playerRef !== playerRef && !e.matchedGameId) ?? null;
}
