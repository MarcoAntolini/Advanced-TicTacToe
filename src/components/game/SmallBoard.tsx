"use client";

import { memo } from "react";
import type { GameState, Player } from "@shared/game/types";
import { Cell } from "./Cell";
import { PlayerMark } from "./PlayerMark";

function BoardClaimOverlay({ winner }: { winner: Player }) {
	const isX = winner === "X";
	return (
		<div
			className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-md border-2 ${
				isX
					? "border-playerX/50 bg-playerX/15"
					: "border-playerO/50 bg-playerO/15"
			}`}
			aria-hidden
		>
			<PlayerMark
				player={winner}
				size="board"
				glow
				className="animate-board-claim select-none"
			/>
		</div>
	);
}

function BoardClosedOverlay() {
	return (
		<div
			className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-md bg-surface/60"
			aria-hidden
		>
			<span className="h-0.5 w-[70%] rotate-45 rounded-full bg-muted/80" />
		</div>
	);
}

type SmallBoardProps = {
	boardIndex: number;
	boardCells: GameState["boards"][number];
	metaWinner: GameState["meta"][number];
	activeBoard: GameState["activeBoard"];
	status: GameState["status"];
	legalCells: Set<number>;
	onMove?: (board: number, cell: number) => void;
	interactive?: boolean;
};

export const SmallBoard = memo(function SmallBoard({
	boardIndex,
	boardCells,
	metaWinner,
	activeBoard,
	status,
	legalCells,
	onMove,
	interactive,
}: SmallBoardProps) {
	const metaWinnerPlayer = metaWinner === "X" || metaWinner === "O" ? metaWinner : null;
	const isWon = metaWinnerPlayer !== null;
	const isClosed = metaWinner !== null || !boardCells.some((cell) => cell === null);
	const isActive =
		interactive &&
		status === "active" &&
		!isWon &&
		!isClosed &&
		(activeBoard === null || activeBoard === boardIndex);

	return (
		<div
			className={`relative grid h-full min-h-0 w-full min-w-0 grid-cols-3 grid-rows-3 gap-1 rounded-md p-1 transition-shadow duration-200 ${
				isActive ? "ring-2 ring-accent bg-[var(--color-active-board)]" : "border border-transparent"
			} ${isWon || isClosed ? "[&_button]:opacity-40" : ""}`}
			role="group"
			aria-label={`Board ${boardIndex + 1}${
				isWon ? `, won by ${metaWinnerPlayer}` : isClosed ? ", closed" : ""
			}`}
		>
			{boardCells.map((cell, cellIndex) => {
				const canPlay = legalCells.has(cellIndex);
				return (
					<Cell
						key={cellIndex}
						player={cell}
						highlight={canPlay}
						disabled={!canPlay || isWon}
						onClick={canPlay && onMove && !isWon ? () => onMove(boardIndex, cellIndex) : undefined}
					/>
				);
			})}

			{isWon && metaWinnerPlayer ? <BoardClaimOverlay winner={metaWinnerPlayer} /> : null}
			{!isWon && isClosed ? <BoardClosedOverlay /> : null}
		</div>
	);
});
