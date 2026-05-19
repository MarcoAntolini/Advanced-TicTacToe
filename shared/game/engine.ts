import {
	BOARD_SIZE,
	type Cell,
	type GameState,
	type Move,
	type Player,
	type SmallBoard,
} from "./types";

const WIN_LINES = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
] as const;

export function createEmptyBoard(): SmallBoard {
	return Array.from({ length: BOARD_SIZE }, () => null);
}

export function createInitialState(): GameState {
	return {
		boards: Array.from({ length: BOARD_SIZE }, () => createEmptyBoard()),
		meta: Array.from({ length: BOARD_SIZE }, () => null),
		currentPlayer: "X",
		activeBoard: null,
		status: "active",
		winner: null,
		moves: [],
	};
}

export function resolveLineWinner(cells: Cell[]): Player | null {
	for (const [a, b, c] of WIN_LINES) {
		if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
			return cells[a];
		}
	}
	return null;
}

export function isBoardFull(board: SmallBoard): boolean {
	return board.every((cell) => cell !== null);
}

export function resolveSmallBoardWinner(board: SmallBoard): Player | null {
	return resolveLineWinner(board);
}

export function resolveMetaWinner(meta: (Player | null)[]): Player | null {
	return resolveLineWinner(meta);
}

export function isBoardClosed(boardIndex: number, state: GameState): boolean {
	if (state.meta[boardIndex] !== null) return true;
	return isBoardFull(state.boards[boardIndex]);
}

export function isBoardPlayable(boardIndex: number, state: GameState): boolean {
	if (state.meta[boardIndex] !== null) return false;
	return state.boards[boardIndex].some((cell) => cell === null);
}

export function getPlayableBoards(state: GameState): number[] {
	return Array.from({ length: BOARD_SIZE }, (_, i) => i).filter((i) =>
		isBoardPlayable(i, state),
	);
}

export function getLegalMoves(state: GameState): { board: number; cell: number }[] {
	if (state.status !== "active") return [];

	const moves: { board: number; cell: number }[] = [];
	const targetBoards =
		state.activeBoard !== null && isBoardPlayable(state.activeBoard, state)
			? [state.activeBoard]
			: getPlayableBoards(state);

	for (const board of targetBoards) {
		const cells = state.boards[board];
		for (let cell = 0; cell < BOARD_SIZE; cell++) {
			if (cells[cell] === null) {
				moves.push({ board, cell });
			}
		}
	}
	return moves;
}

function updateMetaForBoard(state: GameState, boardIndex: number): void {
	const winner = resolveSmallBoardWinner(state.boards[boardIndex]);
	if (winner) {
		state.meta[boardIndex] = winner;
	}
}

function finalizeStatus(state: GameState): void {
	const metaWinner = resolveMetaWinner(state.meta);
	if (metaWinner) {
		state.status = "won";
		state.winner = metaWinner;
		return;
	}

	const playable = getPlayableBoards(state);
	if (playable.length === 0) {
		state.status = "draw";
		state.winner = null;
	}
}

export function applyMove(
	state: GameState,
	board: number,
	cell: number,
): GameState {
	const legal = getLegalMoves(state);
	const isLegal = legal.some((m) => m.board === board && m.cell === cell);
	if (!isLegal) {
		throw new Error("Illegal move");
	}

	const next: GameState = {
		boards: state.boards.map((b) => [...b]),
		meta: [...state.meta],
		currentPlayer: state.currentPlayer,
		activeBoard: state.activeBoard,
		status: state.status,
		winner: state.winner,
		moves: [...state.moves],
	};

	const player = next.currentPlayer;
	next.boards[board][cell] = player;
	next.lastMove = { board, cell };
	next.moves.push({ board, cell, player });

	updateMetaForBoard(next, board);

	const sentBoard = cell;
	if (isBoardPlayable(sentBoard, next)) {
		next.activeBoard = sentBoard;
	} else {
		next.activeBoard = null;
	}

	finalizeStatus(next);

	if (next.status === "active") {
		next.currentPlayer = player === "X" ? "O" : "X";
	}

	return next;
}

export function isGameOver(state: GameState): boolean {
	return state.status !== "active";
}

/** Won without any moves — forfeit, opponent left, or abandoned an active realtime game. */
export function isForfeitWin(
	state: GameState,
	documentWinner?: "X" | "O" | "draw" | null,
): boolean {
	if (state.moves.length > 0) return false;
	const winner = state.winner ?? documentWinner;
	return winner === "X" || winner === "O";
}

/** Mark an in-progress state as won (e.g. forfeit) without changing the board. */
export function stateWithWinner(state: GameState, winner: Player): GameState {
	return {
		...state,
		boards: state.boards.map((b) => [...b]),
		meta: [...state.meta],
		moves: [...state.moves],
		status: "won",
		winner,
	};
}

export type SerializedGameState = ReturnType<typeof serializeGameState>;

/** Stored Convex state may omit `lastMove` when unset (`v.optional` in schema). */
export type SerializedGameStateInput = Omit<SerializedGameState, "lastMove"> & {
	lastMove?: SerializedGameState["lastMove"];
};

export function serializeGameState(state: GameState) {
	return {
		boards: state.boards,
		meta: state.meta,
		currentPlayer: state.currentPlayer,
		activeBoard: state.activeBoard,
		status: state.status,
		winner: state.winner,
		lastMove: state.lastMove,
		moves: state.moves,
	};
}

export function deserializeGameState(data: SerializedGameStateInput): GameState {
	return {
		boards: data.boards.map((b) => [...b]),
		meta: [...data.meta],
		currentPlayer: data.currentPlayer,
		activeBoard: data.activeBoard,
		status: data.status,
		winner: data.winner,
		lastMove: data.lastMove,
		moves: [...data.moves],
	};
}
