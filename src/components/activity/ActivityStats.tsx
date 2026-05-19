"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import { DEFAULT_RATING } from "@shared/ratings/elo";
import { Card } from "@/components/ui/Card";

export function ActivityStats() {
	const profile = useQuery(api.users.queries.getProfile);
	const rankContext = useQuery(api.ratings.queries.getMyRankContext);

	if (profile === undefined) {
		return <p className="text-sm text-muted">Loading stats…</p>;
	}

	if (!profile) {
		return (
			<Card className="border-dashed">
				<p className="text-sm text-muted">Sign in to track wins, losses, and streaks.</p>
			</Card>
		);
	}

	const rating = profile.rating ?? DEFAULT_RATING;

	return (
		<div className="space-y-4">
			<Card>
				<div className="flex flex-wrap items-end justify-between gap-3">
					<div>
						<h2 className="font-medium">Ranked rating</h2>
						<p className="mt-1 font-mono text-3xl font-bold tabular-nums text-accent">
							{rating}
						</p>
						{rankContext ? (
							<p className="mt-1 text-sm text-muted">
								Rank #{rankContext.rank} on leaderboard
							</p>
						) : null}
					</div>
					<Link
						href="/leaderboard"
						className="text-sm font-medium text-accent hover:underline"
					>
						View leaderboard
					</Link>
				</div>
			</Card>
			<Card>
				<h2 className="mb-1 font-medium">Statistics</h2>
				<p className="mb-4 text-xs text-muted">Casual realtime and async games</p>
				<dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
					<div className="rounded-lg bg-surface-elevated p-4 text-center">
						<dt className="text-xs uppercase tracking-wide text-muted">Wins</dt>
						<dd className="mt-1 text-2xl font-bold text-success">{profile.stats.wins}</dd>
					</div>
					<div className="rounded-lg bg-surface-elevated p-4 text-center">
						<dt className="text-xs uppercase tracking-wide text-muted">Losses</dt>
						<dd className="mt-1 text-2xl font-bold text-danger">{profile.stats.losses}</dd>
					</div>
					<div className="rounded-lg bg-surface-elevated p-4 text-center">
						<dt className="text-xs uppercase tracking-wide text-muted">Draws</dt>
						<dd className="mt-1 text-2xl font-bold">{profile.stats.draws}</dd>
					</div>
					<div className="rounded-lg bg-surface-elevated p-4 text-center">
						<dt className="text-xs uppercase tracking-wide text-muted">Streak</dt>
						<dd className="mt-1 text-2xl font-bold text-accent">{profile.stats.streak}</dd>
					</div>
				</dl>
			</Card>
		</div>
	);
}
