import { inferConflictForfeitWinner } from "@shared/policy/joinConflict";
import { isParticipant } from "@shared/policy/participant";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { endGame } from "./endGame";
import { assignSecondPlayer, findOtherActiveRealtime } from "./room";
import type { ResolvedParticipant } from "./participant";
import { participantIdentity } from "./participant";

export type JoinWaitingResult =
	| { result: "rejoin"; gameId: Id<"games"> }
	| { result: "joined"; gameId: Id<"games"> }
	| { result: "needs_confirm"; conflictGameId: Id<"games"> };

export async function forfeitJoinConflictIfNeeded(
	ctx: MutationCtx,
	participant: ResolvedParticipant,
	targetGameId: Id<"games">,
): Promise<void> {
	const conflict = await findOtherActiveRealtime(ctx, participant.playerRef, targetGameId);
	if (!conflict?.playerX || !conflict.playerO) return;

	const winner = inferConflictForfeitWinner(conflict, participantIdentity(participant));
	if (!winner) return;

	await endGame(ctx, conflict, winner);
}

export async function joinWaitingGame(
	ctx: MutationCtx,
	game: Doc<"games">,
	participant: ResolvedParticipant,
	options: { forceLeaveActive?: boolean } = {},
): Promise<JoinWaitingResult> {
	const identity = participantIdentity(participant);

	if (isParticipant(game, identity)) {
		return { result: "rejoin", gameId: game._id };
	}

	if (game.status !== "waiting") {
		throw new Error("This game is no longer waiting for a player");
	}

	if (game.mode === "realtime" && !options.forceLeaveActive) {
		const conflict = await findOtherActiveRealtime(ctx, participant.playerRef, game._id);
		if (conflict) {
			return { result: "needs_confirm", conflictGameId: conflict._id };
		}
	}

	if (options.forceLeaveActive && game.mode === "realtime") {
		await forfeitJoinConflictIfNeeded(ctx, participant, game._id);
	}

	const joined = await assignSecondPlayer(ctx, game._id, participant.playerRef);
	return {
		result: joined.rejoin ? "rejoin" : "joined",
		gameId: joined.gameId,
	};
}
