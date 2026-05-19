"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import { DEFAULT_RATING } from "@shared/ratings/elo";
import { Card } from "@/components/ui/Card";

export function LeaderboardList() {
	const rows = useQuery(api.ratings.queries.listLeaderboard, { limit: 50 });
	const myContext = useQuery(api.ratings.queries.getMyRankContext);

	if (rows === undefined) {
		return <p className="text-sm text-muted">Loading leaderboard…</p>;
	}

	if (rows.length === 0) {
		return (
			<Card className="border-dashed text-center">
				<p className="text-sm text-muted">
					No rated players yet. Be the first to play ranked from the Play hub.
				</p>
			</Card>
		);
	}

	return (
		<Card className="overflow-hidden p-0">
			<ul className="divide-y divide-border">
				{rows.map((row) => {
					const isMe = myContext && row.userId === myContext.userId;
					return (
						<li
							key={row.userId}
							className={`flex items-center gap-4 px-4 py-3 ${
								isMe ? "bg-accent/10" : ""
							}`}
						>
							<span className="w-8 shrink-0 text-center font-mono text-sm text-muted">
								{row.rank}
							</span>
							<div className="min-w-0 flex-1">
								<p className="truncate font-medium text-foreground">
									{row.displayName}
									{isMe ? (
										<span className="ml-2 text-xs font-normal text-accent">(you)</span>
									) : null}
								</p>
								<p className="text-xs text-muted">
									{row.stats.wins}W · {row.stats.losses}L · {row.stats.draws}D
								</p>
							</div>
							<span className="shrink-0 font-mono text-lg font-semibold tabular-nums text-accent">
								{row.rating ?? DEFAULT_RATING}
							</span>
						</li>
					);
				})}
			</ul>
			{myContext ? (
				<p className="border-t border-border px-4 py-3 text-center text-xs text-muted">
					Your rating:{" "}
					<span className="font-semibold text-foreground">{myContext.rating}</span>
					{" · "}
					Rank #{myContext.rank}
				</p>
			) : (
				<p className="border-t border-border px-4 py-3 text-center text-xs text-muted">
					<Link href="/play/ranked" className="text-accent hover:underline">
						Sign in and play ranked
					</Link>{" "}
					to appear on the board.
				</p>
			)}
		</Card>
	);
}
