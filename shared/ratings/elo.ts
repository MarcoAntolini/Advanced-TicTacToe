export const DEFAULT_RATING = 1200;
export const DEFAULT_K = 32;

export type EloOutcome = "X" | "O" | "draw";

export function expectedScore(ratingA: number, ratingB: number): number {
	return 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
}

export function ratingDelta(
	playerRating: number,
	opponentRating: number,
	score: 0 | 0.5 | 1,
	k = DEFAULT_K,
): number {
	return Math.round(k * (score - expectedScore(playerRating, opponentRating)));
}

export function applyEloPair(
	ratingX: number,
	ratingO: number,
	outcome: EloOutcome,
	k = DEFAULT_K,
): { ratingX: number; ratingO: number; deltaX: number; deltaO: number } {
	const scoreX = outcome === "X" ? 1 : outcome === "draw" ? 0.5 : 0;
	const scoreO = outcome === "O" ? 1 : outcome === "draw" ? 0.5 : 0;
	const deltaX = ratingDelta(ratingX, ratingO, scoreX, k);
	const deltaO = ratingDelta(ratingO, ratingX, scoreO, k);
	return {
		ratingX: ratingX + deltaX,
		ratingO: ratingO + deltaO,
		deltaX,
		deltaO,
	};
}
