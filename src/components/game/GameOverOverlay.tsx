"use client";

import Link from "next/link";
import { Trophy, Minus, Home, RotateCcw, Swords, Eye, EyeOff } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { isForfeitWin } from "@shared/game/engine";
import type { GameState, Player } from "@shared/game/types";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
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
	ratingDelta,
	onRestart,
	onRematch,
}: {
	state: GameState;
	ratingDelta?: number;
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
			<div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
				<Button
					variant="secondary"
					onClick={() => setDismissed(false)}
					className="pointer-events-auto gap-2 rounded-full shadow-lg"
					aria-label="Show game results"
				>
					<Eye className="h-4 w-4 text-accent" aria-hidden />
					<span>{title}</span>
					<span className="text-muted">· Show results</span>
				</Button>
			</div>
		);
	}

	return (
		<Dialog
			open={!dismissed}
			onOpenChange={(open) => {
				if (!open) setDismissed(true);
			}}
		>
			<DialogContent
				className="flex max-w-md flex-col gap-6 border-border bg-surface p-6 sm:p-8"
				onInteractOutside={(event) => event.preventDefault()}
			>
				{isWin ? <Confetti /> : null}

				<div className="flex flex-col items-center gap-4 text-center">
					<div className="flex flex-col items-center gap-3">
						<div
							className={`flex h-14 w-14 items-center justify-center rounded-full ${
								state.status === "draw"
									? "bg-surface-elevated text-muted"
									: state.winner === "X"
										? "bg-playerX/20 text-playerX"
										: "bg-playerO/20 text-playerO"
							} ${isWin ? "animate-winner-glow" : ""}`}
							style={{ "--glow-color": glow } as CSSProperties}
						>
							<Icon className="h-7 w-7" aria-hidden />
						</div>

						{isWin && state.winner ? (
							<div className="animate-board-claim" aria-hidden>
								<PlayerMark player={state.winner} size="hero" glow />
							</div>
						) : null}
					</div>

					<div className="space-y-2">
						<DialogTitle className="text-2xl leading-tight">{title}</DialogTitle>
						<DialogDescription className="text-balance leading-relaxed">
							{subtitle}
						</DialogDescription>
						{ratingDelta !== undefined ? (
							<p
								className={`pt-1 font-mono text-lg font-semibold tabular-nums ${
									ratingDelta > 0
										? "text-success"
										: ratingDelta < 0
											? "text-danger"
											: "text-muted"
								}`}
							>
								Rating {ratingDelta > 0 ? "+" : ""}
								{ratingDelta}
							</p>
						) : null}
					</div>
				</div>

				<div className="flex flex-col gap-3 border-t border-border pt-5">
					<Button
						variant="ghost"
						onClick={() => setDismissed(true)}
						className="h-10 min-h-10 w-full gap-2 text-muted"
					>
						<EyeOff className="h-4 w-4" aria-hidden />
						View board
					</Button>

					<div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
						{onRematch ? (
							<Button onClick={onRematch} className="gap-2 sm:min-w-[8.75rem]">
								<Swords className="h-4 w-4" aria-hidden />
								Rematch
							</Button>
						) : null}
						{onRestart ? (
							<Button
								variant="secondary"
								onClick={onRestart}
								className="gap-2 sm:min-w-[8.75rem]"
							>
								<RotateCcw className="h-4 w-4" aria-hidden />
								Play again
							</Button>
						) : null}
						<Link href="/" className="sm:min-w-[8.75rem]">
							<Button variant="ghost" className="w-full gap-2">
								<Home className="h-4 w-4" aria-hidden />
								Home
							</Button>
						</Link>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
