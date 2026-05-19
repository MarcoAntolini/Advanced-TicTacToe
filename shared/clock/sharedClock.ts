import type { Player } from "../game/types";

export type SharedClock = {
	clockXMs: number;
	clockOMs: number;
	incrementMs: number;
	turnStartedAt: number;
	currentPlayer: Player;
};

export function deductActiveClock(
	clock: SharedClock,
	now: number,
): {
	clockXMs: number;
	clockOMs: number;
	expired: boolean;
	timedOutPlayer: Player | null;
} {
	const elapsed = Math.max(0, now - clock.turnStartedAt);
	if (clock.currentPlayer === "X") {
		const remaining = clock.clockXMs - elapsed;
		return {
			clockXMs: Math.max(0, remaining),
			clockOMs: clock.clockOMs,
			expired: remaining <= 0,
			timedOutPlayer: remaining <= 0 ? "X" : null,
		};
	}
	const remaining = clock.clockOMs - elapsed;
	return {
		clockXMs: clock.clockXMs,
		clockOMs: Math.max(0, remaining),
		expired: remaining <= 0,
		timedOutPlayer: remaining <= 0 ? "O" : null,
	};
}

export function applyIncrement(
	clockXMs: number,
	clockOMs: number,
	mover: Player,
	incrementMs: number,
): { clockXMs: number; clockOMs: number } {
	if (incrementMs <= 0) return { clockXMs, clockOMs };
	if (mover === "X") return { clockXMs: clockXMs + incrementMs, clockOMs };
	return { clockXMs, clockOMs: clockOMs + incrementMs };
}

export function formatClockMs(ms: number): string {
	const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
