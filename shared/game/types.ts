export type Player = "X" | "O";
export type Cell = Player | null;
export type SmallBoard = Cell[];
export type GameStatus = "active" | "won" | "draw";

export type Move = {
	board: number;
	cell: number;
	player: Player;
};

export type GameState = {
	boards: SmallBoard[];
	meta: (Player | null)[];
	currentPlayer: Player;
	activeBoard: number | null;
	status: GameStatus;
	winner: Player | null;
	lastMove?: { board: number; cell: number };
	moves: Move[];
};

export const BOARD_SIZE = 9;
export const META_SIZE = 9;
