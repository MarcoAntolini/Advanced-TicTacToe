import {
	CURRENT_SEASON_ID,
	CURRENT_SEASON_LABEL,
} from "@shared/ratings/constants";
import type { MutationCtx, QueryCtx } from "../../_generated/server";

export type SeasonInfo = {
	seasonId: number;
	label: string;
	isActive: boolean;
	startsAt?: number;
	endsAt?: number;
};

type Ctx = QueryCtx | MutationCtx;

/** Fallback when the seasons table has not been seeded yet. */
export function fallbackActiveSeason(): SeasonInfo {
	return {
		seasonId: CURRENT_SEASON_ID,
		label: CURRENT_SEASON_LABEL,
		isActive: true,
	};
}

/**
 * Resolve the active competitive season from the database.
 * Falls back to shared constants if no row is marked active (pre-seed / migration).
 *
 * Future: leaderboard, matchmaking, and Elo reads can switch to `seasonRatings`
 * filtered by this seasonId without changing call sites.
 */
export async function getActiveSeason(ctx: Ctx): Promise<SeasonInfo> {
	const active = await ctx.db
		.query("seasons")
		.withIndex("by_active", (q) => q.eq("isActive", true))
		.first();

	if (!active) return fallbackActiveSeason();

	return {
		seasonId: active.seasonId,
		label: active.label,
		isActive: active.isActive,
		startsAt: active.startsAt,
		endsAt: active.endsAt,
	};
}

export async function getActiveSeasonId(ctx: Ctx): Promise<number> {
	return (await getActiveSeason(ctx)).seasonId;
}

/** Idempotent — safe to call from mutations and cron. */
export async function ensureSeasonsSeeded(ctx: MutationCtx): Promise<void> {
	const existing = await ctx.db
		.query("seasons")
		.withIndex("by_seasonId", (q) => q.eq("seasonId", CURRENT_SEASON_ID))
		.unique();

	if (existing) return;

	await ctx.db.insert("seasons", {
		seasonId: CURRENT_SEASON_ID,
		label: CURRENT_SEASON_LABEL,
		isActive: true,
	});
}
