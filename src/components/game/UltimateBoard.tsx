"use client";

import type { GameState } from "@shared/game/types";
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
	return (
		<div
			className="mx-auto grid max-w-lg grid-cols-3 gap-1 sm:gap-2"
			role="grid"
			aria-label="Ultimate tic-tac-toe board"
		>
			{Array.from({ length: 9 }, (_, i) => (
				<SmallBoard
					key={i}
					boardIndex={i}
					state={state}
					onMove={onMove}
					interactive={interactive && state.status === "active"}
				/>
			))}
		</div>
	);
}
