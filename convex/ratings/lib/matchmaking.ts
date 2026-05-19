import type { Doc, Id } from "../../_generated/dataModel";
import { DEFAULT_RATING } from "@shared/ratings/elo";
import { ratingsCompatible } from "@shared/ratings/matchmaking";
type QueueEntry = Doc<"matchmakingQueue">;
export function findRankedOpponent(
	entries: QueueEntry[],
	myUserId: Id<"users">,
	myRating: number,
	myJoinedAt: number,
	now: number,
): QueueEntry | null {
	const candidates = entries
		.filter((e) => e.playerRef !== myUserId && !e.matchedGameId)
		.filter((entry) => {
			const opponentRating = entry.ratingAtJoin ?? DEFAULT_RATING;
			return ratingsCompatible(
				myRating,
				opponentRating,
				myJoinedAt,
				entry.joinedAt,
				now,
			);
		})
		.sort((a, b) => a.joinedAt - b.joinedAt);

	return candidates[0] ?? null;
}
