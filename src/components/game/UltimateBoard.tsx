"use client";

import { useMemo } from "react";
import type { GameState } from "@shared/game/types";
import { getLegalMoves } from "@shared/game/engine";
import { SmallBoard } from "./SmallBoard";

export function UltimateBoard({
	state,
	onMove,
	interactive = true,
}: {
	state: GameState;
	onMove?: (board: number, cell: number) => void;
	interactive?: boolean;
}) {
	const legalByBoard = useMemo(() => {
		if (!interactive || state.status !== "active") {
			return Array.from({ length: 9 }, () => new Set<number>());
		}
		const moves = getLegalMoves(state);
		const byBoard = Array.from({ length: 9 }, () => new Set<number>());
		for (const { board, cell } of moves) {
			byBoard[board].add(cell);
		}
		return byBoard;
	}, [state, interactive]);

	return (
		<div
			className="mx-auto grid aspect-square w-full grid-cols-3 grid-rows-3 gap-1.5 sm:gap-2"
			role="grid"
			aria-label="Ultimate tic-tac-toe board"
		>
			{Array.from({ length: 9 }, (_, i) => (
				<SmallBoard
					key={i}
					boardIndex={i}
					boardCells={state.boards[i]}
					metaWinner={state.meta[i]}
					activeBoard={state.activeBoard}
					status={state.status}
					legalCells={legalByBoard[i]}
					onMove={onMove}
					interactive={interactive}
				/>
			))}
		</div>
	);
}
