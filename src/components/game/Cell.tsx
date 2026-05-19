"use client";

import type { Player } from "@shared/game/types";
import { PlayerMark } from "./PlayerMark";

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
			className={`flex h-full min-h-0 w-full min-w-0 items-center justify-center rounded-sm border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-safe:active:scale-95 ${
				highlight ? "border-accent bg-[var(--color-active-board)]" : "border-border bg-surface"
			} ${disabled || !onClick ? "cursor-default" : "cursor-pointer hover:bg-surface-elevated"}`}
		>
			{player ? <PlayerMark player={player} size="cell" /> : null}
		</button>
	);
}
