import type { Player } from "../game/types";
import { forfeitWinnerWhenLeaving, type ParticipantIdentity, type PlayerSlots } from "./participant";

export type JoinWaitingResult =
	| { result: "rejoin"; gameId: string }
	| { result: "joined"; gameId: string }
	| { result: "needs_confirm"; conflictGameId: string };

export function inferConflictForfeitWinner(
	conflict: PlayerSlots,
	identity: ParticipantIdentity,
): Player | null {
	if (!conflict.playerX || !conflict.playerO) return null;
	return forfeitWinnerWhenLeaving(conflict, identity);
}
