import type { Id } from "../_generated/dataModel";
import { isUserId } from "./isUserId";

type StatsCtx = {
	db: {
		get: (id: Id<"users">) => Promise<{
			stats: { wins: number; losses: number; draws: number; streak: number };
		} | null>;
		patch: (
			id: Id<"users">,
			data: { stats: { wins: number; losses: number; draws: number; streak: number } },
		) => Promise<void>;
	};
};

async function updateStatsForUser(
	ctx: StatsCtx,
	userId: Id<"users">,
	result: "win" | "loss" | "draw",
) {
	const user = await ctx.db.get(userId);
	if (!user) return;
	const stats = { ...user.stats };
	if (result === "win") {
		stats.wins += 1;
		stats.streak += 1;
	} else if (result === "loss") {
		stats.losses += 1;
		stats.streak = 0;
	} else {
		stats.draws += 1;
		stats.streak = 0;
	}
	await ctx.db.patch(userId, { stats });
}

export async function applyStatsResult(
	ctx: StatsCtx,
	winner: "X" | "O" | "draw",
	playerX: Id<"users"> | string | null,
	playerO: Id<"users"> | string | null,
) {
	if (winner === "draw") {
		if (isUserId(playerX)) await updateStatsForUser(ctx, playerX, "draw");
		if (isUserId(playerO)) await updateStatsForUser(ctx, playerO, "draw");
		return;
	}
	const winnerId = winner === "X" ? playerX : playerO;
	const loserId = winner === "X" ? playerO : playerX;
	if (isUserId(winnerId)) await updateStatsForUser(ctx, winnerId, "win");
	if (isUserId(loserId)) await updateStatsForUser(ctx, loserId, "loss");
}
