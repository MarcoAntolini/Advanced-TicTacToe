"use client";

import type { GameState } from "@shared/game/types";
import { getLegalMoves, isBoardPlayable } from "@shared/game/engine";
import { Cell } from "./Cell";

export function SmallBoard({
	boardIndex,
	state,
	onMove,
	interactive,
}: {
	boardIndex: number;
	state: GameState;
	onMove?: (board: number, cell: number) => void;
	interactive?: boolean;
}) {
	const legal = interactive ? getLegalMoves(state) : [];
	const isActive =
		interactive &&
		(state.activeBoard === null || state.activeBoard === boardIndex) &&
		isBoardPlayable(boardIndex, state);
	const isClosed = !isBoardPlayable(boardIndex, state);
	const metaWinner = state.meta[boardIndex];

	return (
		<div
			className={`grid grid-cols-3 gap-0.5 rounded-md p-1 ${
				isActive ? "ring-2 ring-accent bg-[var(--color-active-board)]" : ""
			} ${isClosed ? "opacity-50" : ""}`}
			role="group"
			aria-label={`Board ${boardIndex + 1}${metaWinner ? `, won by ${metaWinner}` : ""}`}
		>
			{state.boards[boardIndex].map((cell, cellIndex) => {
				const canPlay = legal.some((m) => m.board === boardIndex && m.cell === cellIndex);
				return (
					<Cell
						key={cellIndex}
						player={cell}
						highlight={canPlay}
						disabled={!canPlay}
						onClick={canPlay && onMove ? () => onMove(boardIndex, cellIndex) : undefined}
					/>
				);
			})}
		</div>
	);
}
