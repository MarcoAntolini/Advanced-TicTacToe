"use client";

import type { Player } from "@shared/game/types";

export function Cell({
	player,
	onClick,
	disabled,
	highlight,
}: {
	player: Player | null;
	onClick?: () => void;
	disabled?: boolean;
	highlight?: boolean;
}) {
	const label = player ? `Cell ${player}` : "Empty cell";
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled || !onClick}
			aria-label={label}
			className={`flex aspect-square min-h-11 min-w-11 items-center justify-center rounded-sm border text-lg font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
				highlight ? "border-accent bg-[var(--color-active-board)]" : "border-border bg-surface"
			} ${disabled || !onClick ? "cursor-default opacity-60" : "cursor-pointer hover:bg-surface-elevated active:scale-95"} ${
				player === "X" ? "text-playerX" : player === "O" ? "text-playerO" : ""
			}`}
		>
			{player ?? ""}
		</button>
	);
}
