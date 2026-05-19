"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { isForfeitWin } from "@shared/game/engine";
import type { GameState } from "@shared/game/types";

export function GameHeader({
	state,
	mode,
	gameStatus,
	onRestart,
	onForfeit,
	onRematch,
	showBack = true,
}: {
	state: GameState;
	mode: string;
	gameStatus?: "waiting" | "active" | "finished";
	onRestart?: () => void;
	onForfeit?: () => void;
	onRematch?: () => void;
	showBack?: boolean;
}) {
	const statusText =
		gameStatus === "waiting"
			? "Waiting for opponent"
			: state.status === "won"
				? isForfeitWin(state)
					? `${state.winner} wins by forfeit`
					: `${state.winner} wins`
				: state.status === "draw"
					? "Draw"
					: `${state.currentPlayer}'s turn`;

	return (
		<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-3">
				{showBack ? (
					<Link
						href="/play"
						className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent"
						aria-label="Back to play"
					>
						<ArrowLeft className="h-5 w-5" />
					</Link>
				) : null}
				<div>
					<p className="text-sm capitalize text-muted">{mode} game</p>
					<h1 className="text-2xl font-semibold" aria-live="polite">
						{statusText}
					</h1>
				</div>
			</div>
			<div className="flex flex-wrap gap-2">
				{onRestart ? (
					<Button variant="secondary" onClick={onRestart}>
						Restart
					</Button>
				) : null}
				{onForfeit && state.status === "active" && gameStatus === "active" ? (
					<Button variant="danger" onClick={onForfeit}>
						Forfeit
					</Button>
				) : null}
				{onRematch && state.status !== "active" ? (
					<Button onClick={onRematch}>Rematch</Button>
				) : null}
			</div>
		</div>
	);
}
