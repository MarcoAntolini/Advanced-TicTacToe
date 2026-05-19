"use client";

import { useEffect, useMemo, useState } from "react";
import { deductActiveClock, formatClockMs } from "@shared/clock/sharedClock";
import type { Player } from "@shared/game/types";

type RankedClockGame = {
	isRanked?: boolean;
	clockXMs?: number;
	clockOMs?: number;
	clockIncrementMs?: number;
	currentTurnStartedAt?: number;
	state: { currentPlayer: Player };
};

export function RankedClockBar({ game }: { game: RankedClockGame }) {
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		if (!game.isRanked) return;
		const id = window.setInterval(() => setNow(Date.now()), 250);
		return () => window.clearInterval(id);
	}, [game.isRanked]);

	const display = useMemo(() => {
		if (
			!game.isRanked ||
			game.clockXMs === undefined ||
			game.clockOMs === undefined ||
			game.clockIncrementMs === undefined ||
			game.currentTurnStartedAt === undefined
		) {
			return null;
		}

		const deducted = deductActiveClock(
			{
				clockXMs: game.clockXMs,
				clockOMs: game.clockOMs,
				incrementMs: game.clockIncrementMs,
				turnStartedAt: game.currentTurnStartedAt,
				currentPlayer: game.state.currentPlayer,
			},
			now,
		);

		return {
			xMs: deducted.clockXMs,
			oMs: deducted.clockOMs,
			active: game.state.currentPlayer,
		};
	}, [game, now]);

	if (!display) return null;

	return (
		<div
			className="mb-4 grid grid-cols-2 gap-3 rounded-lg border border-border bg-surface-elevated p-3"
			role="group"
			aria-label="Ranked clocks"
		>
			<ClockCell label="X" ms={display.xMs} active={display.active === "X"} />
			<ClockCell label="O" ms={display.oMs} active={display.active === "O"} />
		</div>
	);
}

function ClockCell({
	label,
	ms,
	active,
}: {
	label: string;
	ms: number;
	active: boolean;
}) {
	const low = ms < 30_000;
	return (
		<div
			className={`rounded-md px-3 py-2 text-center ${
				active ? "ring-2 ring-accent bg-surface" : "bg-bg/40"
			}`}
		>
			<p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
			<p
				className={`mt-1 font-mono text-lg font-semibold tabular-nums ${
					low ? "text-danger" : "text-foreground"
				}`}
			>
				{formatClockMs(ms)}
			</p>
		</div>
	);
}
