import type { Player } from "../game/types";

export type ParticipantIdentity = {
	userId?: string | null;
	guestId?: string | null;
};

export type PlayerSlots = {
	playerX: string | null;
	playerO: string | null;
};

/** Identity keys a client may present when matching player slots. */
export function participantKeys(identity: ParticipantIdentity): string[] {
	return [identity.userId, identity.guestId].filter(Boolean) as string[];
}

export function isParticipant(game: PlayerSlots, identity: ParticipantIdentity): boolean {
	const keys = participantKeys(identity);
	return keys.some((key) => key === game.playerX || key === game.playerO);
}

export function participantSide(
	game: PlayerSlots,
	identity: ParticipantIdentity,
): Player | null {
	const keys = participantKeys(identity);
	if (keys.some((key) => key === game.playerX)) return "X";
	if (keys.some((key) => key === game.playerO)) return "O";
	return null;
}

/** Winner when the participant abandons an active realtime game to join another. */
export function forfeitWinnerWhenLeaving(
	game: PlayerSlots,
	identity: ParticipantIdentity,
): Player | null {
	const side = participantSide(game, identity);
	if (!side) return null;
	return side === "X" ? "O" : "X";
}

export function canMoveAs(
	game: PlayerSlots & { mode?: string },
	identity: ParticipantIdentity,
	currentPlayer: Player,
): boolean {
	if (game.mode === "local") return true;
	const side = participantSide(game, identity);
	if (currentPlayer === "X") return side === "X";
	if (currentPlayer === "O") return side === "O";
	return false;
}
