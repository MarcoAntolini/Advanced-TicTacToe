import {
	deserializeGameState,
	serializeGameState,
	stateWithWinner,
	type Player,
} from "./game";
import type { Doc } from "../_generated/dataModel";

export function buildFinishedGamePatch(
	game: Pick<Doc<"games">, "state">,
	winner: Player | "draw",
) {
	const state = deserializeGameState(game.state);
	const nextState =
		winner === "draw"
			? { ...state, status: "draw" as const, winner: null }
			: stateWithWinner(state, winner);

	return {
		status: "finished" as const,
		winner,
		finishedAt: Date.now(),
		state: serializeGameState(nextState),
	};
}
