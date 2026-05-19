import { describe, expect, it } from "vitest";
import {
	applyMove,
	createInitialState,
	getLegalMoves,
	resolveMetaWinner,
	resolveSmallBoardWinner,
	isForfeitWin,
	stateWithWinner,
} from "./engine";

describe("Ultimate Tic-Tac-Toe engine", () => {
	it("starts with free choice and X to move", () => {
		const state = createInitialState();
		expect(state.currentPlayer).toBe("X");
		expect(state.activeBoard).toBeNull();
		expect(getLegalMoves(state).length).toBe(81);
	});

	it("forces next move into the board matching the cell played", () => {
		let state = createInitialState();
		state = applyMove(state, 4, 0);
		expect(state.currentPlayer).toBe("O");
		expect(state.activeBoard).toBe(0);
		const moves = getLegalMoves(state);
		expect(moves.every((m) => m.board === 0)).toBe(true);
	});

	it("grants free choice when sent to a closed board", () => {
		let state = createInitialState();
		for (let i = 0; i < 9; i++) {
			const moves = getLegalMoves(state);
			const target = moves.find((m) => m.board === 4) ?? moves[0];
			state = applyMove(state, target.board, target.cell);
			if (state.status !== "active") break;
		}
		const board4Closed = state.meta[4] !== null || state.boards[4].every((c) => c !== null);
		if (board4Closed) {
			const moves = getLegalMoves(state);
			expect(moves.some((m) => m.board !== 4)).toBe(true);
		}
	});

	it("detects small board winner", () => {
		const board = ["X", "X", "X", null, "O", null, null, "O", null] as const;
		expect(resolveSmallBoardWinner([...board])).toBe("X");
	});

	it("detects meta game winner", () => {
		const meta = [
			"X",
			"X",
			"X",
			null,
			"O",
			null,
			null,
			"O",
			null,
		] as const;
		expect(resolveMetaWinner([...meta])).toBe("X");
	});

	it("rejects illegal moves", () => {
		let state = createInitialState();
		state = applyMove(state, 0, 0);
		expect(() => applyMove(state, 0, 0)).toThrow("Illegal move");
	});

	it("marks state as won without changing the board", () => {
		const state = createInitialState();
		const finished = stateWithWinner(state, "O");
		expect(finished.status).toBe("won");
		expect(finished.winner).toBe("O");
		expect(finished.boards).toEqual(state.boards);
	});

	it("detects forfeit wins with no moves played", () => {
		const state = createInitialState();
		expect(isForfeitWin(state)).toBe(false);
		expect(isForfeitWin(stateWithWinner(state, "O"))).toBe(true);
		expect(isForfeitWin(state, "O")).toBe(true);
	});
});
