import { applyIncrement, deductActiveClock } from "@shared/clock/sharedClock";
import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { endGame } from "../../lib/endGame";
import type { Player } from "../../lib/game";

export type RankedClockFields = Pick<
	Doc<"games">,
	| "_id"
	| "isRanked"
	| "status"
	| "state"
	| "playerX"
	| "playerO"
	| "clockXMs"
	| "clockOMs"
	| "clockIncrementMs"
	| "currentTurnStartedAt"
>;

export function getSharedClock(game: RankedClockFields) {
	if (
		game.clockXMs === undefined ||
		game.clockOMs === undefined ||
		game.clockIncrementMs === undefined ||
		game.currentTurnStartedAt === undefined
	) {
		return null;
	}
	return {
		clockXMs: game.clockXMs,
		clockOMs: game.clockOMs,
		incrementMs: game.clockIncrementMs,
		turnStartedAt: game.currentTurnStartedAt,
		currentPlayer: game.state.currentPlayer,
	};
}

/** Deduct elapsed time; returns patch fields or finishes on timeout. */
export async function enforceRankedClockBeforeMove(
	ctx: MutationCtx,
	game: RankedClockFields,
): Promise<{ timedOut: true; winner: Player } | { timedOut: false; clockPatch: Record<string, number> }> {
	const clock = getSharedClock(game);
	if (!game.isRanked || !clock) {
		return { timedOut: false, clockPatch: {} };
	}

	const now = Date.now();
	const deducted = deductActiveClock(clock, now);

	if (deducted.expired && deducted.timedOutPlayer) {
		const winner: Player = deducted.timedOutPlayer === "X" ? "O" : "X";
		await endGame(ctx, game, winner, {
			clockXMs: deducted.clockXMs,
			clockOMs: deducted.clockOMs,
		});
		return { timedOut: true, winner };
	}

	return {
		timedOut: false,
		clockPatch: {
			clockXMs: deducted.clockXMs,
			clockOMs: deducted.clockOMs,
		},
	};
}

export function rankedClockPatchAfterMove(
	game: RankedClockFields,
	mover: Player,
	clockXMs: number,
	clockOMs: number,
): { clockXMs: number; clockOMs: number; currentTurnStartedAt: number } {
	const withIncrement =
		game.isRanked && game.clockIncrementMs !== undefined
			? applyIncrement(clockXMs, clockOMs, mover, game.clockIncrementMs)
			: { clockXMs, clockOMs };
	return {
		clockXMs: withIncrement.clockXMs,
		clockOMs: withIncrement.clockOMs,
		currentTurnStartedAt: Date.now(),
	};
}

export async function forfeitRankedClocks(
	ctx: MutationCtx,
	game: RankedClockFields,
): Promise<Record<string, number>> {
	const clock = getSharedClock(game);
	if (!game.isRanked || !clock) return {};

	const deducted = deductActiveClock(clock, Date.now());
	return {
		clockXMs: deducted.clockXMs,
		clockOMs: deducted.clockOMs,
	};
}

export async function expireRankedGameOnClock(
	ctx: MutationCtx,
	game: RankedClockFields & { _id: Id<"games"> },
): Promise<boolean> {
	if (!game.isRanked || game.status !== "active") return false;

	const clock = getSharedClock(game);
	if (!clock) return false;

	const deducted = deductActiveClock(clock, Date.now());
	if (!deducted.expired || !deducted.timedOutPlayer) {
		if (deducted.clockXMs !== game.clockXMs || deducted.clockOMs !== game.clockOMs) {
			await ctx.db.patch(game._id, {
				clockXMs: deducted.clockXMs,
				clockOMs: deducted.clockOMs,
			});
		}
		return false;
	}

	const winner: Player = deducted.timedOutPlayer === "X" ? "O" : "X";
	await endGame(ctx, game, winner, {
		clockXMs: deducted.clockXMs,
		clockOMs: deducted.clockOMs,
	});
	return true;
}
