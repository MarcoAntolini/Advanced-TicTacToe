"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export function HomeDashboard() {
	const profile = useQuery(api.users.queries.getProfile);
	const asyncGames = useQuery(api.games.queries.listMyTurns);

	if (profile === undefined) {
		return <p className="text-muted">Loading…</p>;
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2">
			{profile ? (
				<Card>
					<h3 className="font-medium">{profile.displayName}</h3>
					<dl className="mt-3 grid grid-cols-4 gap-2 text-center text-sm">
						<div>
							<dt className="text-muted">Wins</dt>
							<dd className="text-lg font-semibold text-success">{profile.stats.wins}</dd>
						</div>
						<div>
							<dt className="text-muted">Losses</dt>
							<dd className="text-lg font-semibold text-danger">{profile.stats.losses}</dd>
						</div>
						<div>
							<dt className="text-muted">Draws</dt>
							<dd className="text-lg font-semibold">{profile.stats.draws}</dd>
						</div>
						<div>
							<dt className="text-muted">Streak</dt>
							<dd className="text-lg font-semibold text-accent">{profile.stats.streak}</dd>
						</div>
					</dl>
				</Card>
			) : (
				<Card>
					<p className="text-muted">Sign in to track stats and history.</p>
				</Card>
			)}

			{asyncGames && asyncGames.length > 0 ? (
				<Card>
					<h3 className="mb-3 font-medium">Your async turns</h3>
					<ul className="space-y-2">
						{asyncGames.map((g) => (
							<li key={g._id}>
								<Link
									href={`/game/${g._id}`}
									className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-surface-elevated"
								>
									<span>Game vs opponent</span>
									<Badge>Your turn</Badge>
								</Link>
							</li>
						))}
					</ul>
				</Card>
			) : null}
		</div>
	);
}
