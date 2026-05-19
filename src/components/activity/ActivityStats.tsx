"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card } from "@/components/ui/Card";

export function ActivityStats() {
	const profile = useQuery(api.users.queries.getProfile);

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

	return (
		<Card>
			<h2 className="mb-4 font-medium">Statistics</h2>
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
	);
}
