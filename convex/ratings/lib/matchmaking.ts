import { DEFAULT_RATING } from "@shared/ratings/elo";
import { ratingsCompatible } from "@shared/ratings/matchmaking";
import type { Doc, Id } from "../../_generated/dataModel";

type QueueEntry = Doc<"rankedMatchmakingQueue">;

export function findRankedOpponent(
	entries: QueueEntry[],
	myUserId: Id<"users">,
	myRating: number,
	myJoinedAt: number,
	now: number,
): QueueEntry | null {
	const candidates = entries
		.filter((e) => e.userId !== myUserId)
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
