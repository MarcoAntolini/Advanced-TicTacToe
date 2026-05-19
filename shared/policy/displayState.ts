import type { GameState, Player } from "../game/types";

export type GameDocumentStatus = {
	status: "waiting" | "active" | "finished";
	winner?: Player | "draw" | null;
};

/**
 * Align engine state with document status when older games only patched `game.status`.
 */
export function reconcileDisplayState(
	state: GameState,
	doc: GameDocumentStatus | undefined,
	options: { localMode?: boolean } = {},
): GameState {
	if (!doc || options.localMode || doc.status !== "finished" || state.status !== "active") {
		return state;
	}
	if (doc.winner === "draw") {
		return { ...state, status: "draw", winner: null };
	}
	if (doc.winner === "X" || doc.winner === "O") {
		return { ...state, status: "won", winner: doc.winner };
	}
	return state;
}
