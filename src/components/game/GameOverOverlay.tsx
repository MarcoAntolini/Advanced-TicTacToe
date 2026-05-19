"use client";

import Link from "next/link";
import { Trophy, Minus, Home, RotateCcw, Swords, Eye, EyeOff } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { isForfeitWin } from "@shared/game/engine";
import type { GameState, Player } from "@shared/game/types";
import { Button } from "@/components/ui/Button";
import { PlayerMark } from "./PlayerMark";

function Confetti() {
	const pieces = Array.from({ length: 24 }, (_, i) => ({
		id: i,
		left: `${(i * 17 + 5) % 100}%`,
		delay: `${(i % 8) * 0.15}s`,
		duration: `${2.2 + (i % 5) * 0.3}s`,
		color: i % 2 === 0 ? "var(--color-x)" : "var(--color-o)",
		size: 6 + (i % 4) * 2,
	}));

	return (
		<div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
			{pieces.map((p) => (
				<span
					key={p.id}
					className="animate-confetti absolute top-0 rounded-sm opacity-80"
					style={
						{
							left: p.left,
							width: p.size,
							height: p.size * 1.4,
							backgroundColor: p.color,
							animationDelay: p.delay,
							"--fall-duration": p.duration,
						} as CSSProperties
					}
				/>
			))}
		</div>
	);
}

function getOutcomeCopy(state: GameState) {
	if (state.status === "draw") {
		return {
			title: "Draw",
			subtitle: "No one claims the meta-board. Well fought.",
			icon: Minus,
			glow: "var(--color-text-muted)",
		};
	}
	const winner = state.winner as Player;
	if (isForfeitWin(state)) {
		return {
			title: `${winner} wins by forfeit`,
			subtitle: "The opponent left or conceded before any moves were played.",
			icon: Trophy,
			glow: winner === "X" ? "var(--color-x)" : "var(--color-o)",
		};
	}
	return {
		title: `${winner} wins!`,
		subtitle: "Three mini-boards in a row on the meta-grid.",
		icon: Trophy,
		glow: winner === "X" ? "var(--color-x)" : "var(--color-o)",
	};
}

export function GameOverOverlay({
	state,
	onRestart,
	onRematch,
}: {
	state: GameState;
	onRestart?: () => void;
	onRematch?: () => void;
}) {
	const [dismissed, setDismissed] = useState(false);

	useEffect(() => {
		if (state.status === "active") setDismissed(false);
	}, [state.status]);

	if (state.status === "active") return null;

	const { title, subtitle, icon: Icon, glow } = getOutcomeCopy(state);
	const isWin = state.status === "won";

	if (dismissed) {
		return (
			<div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
				<button
					type="button"
					onClick={() => setDismissed(false)}
					className="pointer-events-auto flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-5 py-2 text-sm font-medium text-foreground shadow-lg transition-colors hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
					aria-label="Show game results"
				>
					<Eye className="h-4 w-4 text-accent" aria-hidden />
					<span>{title}</span>
					<span className="text-muted">· Show results</span>
				</button>
			</div>
		);
	}

	return (
		<div
			className="animate-overlay-fade fixed inset-0 z-50 flex items-center justify-center p-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby="game-over-title"
		>
			<div className="absolute inset-0 bg-bg/80 backdrop-blur-sm" aria-hidden />
			{isWin ? <Confetti /> : null}

			<div className="animate-overlay-panel relative w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-2xl">
				<div className="flex flex-col items-center text-center">
					<div
						className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
							state.status === "draw"
								? "bg-muted/20 text-muted"
								: state.winner === "X"
									? "bg-playerX/20 text-playerX"
									: "bg-playerO/20 text-playerO"
						} ${isWin ? "animate-winner-glow" : ""}`}
						style={{ "--glow-color": glow } as CSSProperties}
					>
						<Icon className="h-8 w-8" aria-hidden />
					</div>

					{isWin && state.winner ? (
						<div className="mb-2 animate-board-claim" aria-hidden>
							<PlayerMark player={state.winner} size="hero" glow />
						</div>
					) : null}

					<h2 id="game-over-title" className="text-2xl font-bold text-foreground">
						{title}
					</h2>
					<p className="mt-2 text-muted">{subtitle}</p>

					<Button
						variant="ghost"
						onClick={() => setDismissed(true)}
						className="mt-6 gap-2"
					>
						<EyeOff className="h-4 w-4" aria-hidden />
						View board
					</Button>

					<div className="mt-4 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
						{onRematch ? (
							<Button onClick={onRematch} className="gap-2 sm:min-w-[140px]">
								<Swords className="h-4 w-4" aria-hidden />
								Rematch
							</Button>
						) : null}
						{onRestart ? (
							<Button variant="secondary" onClick={onRestart} className="gap-2 sm:min-w-[140px]">
								<RotateCcw className="h-4 w-4" aria-hidden />
								Play again
							</Button>
						) : null}
						<Link href="/" className="sm:min-w-[140px]">
							<Button variant="ghost" className="w-full gap-2">
								<Home className="h-4 w-4" aria-hidden />
								Home
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
