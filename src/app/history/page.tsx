"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import { Card } from "@/components/ui/Card";

export default function HistoryPage() {
	const history = useQuery(api.games.queries.listHistory, {
		paginationOpts: { numItems: 20, cursor: null },
	});

	if (history === undefined) {
		return <p className="text-muted">Loading history…</p>;
	}

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold">Game history</h1>
			{history.page.length === 0 ? (
				<Card>
					<p className="text-muted">No finished games yet. Play online to build your history.</p>
				</Card>
			) : (
				<ul className="space-y-2">
					{history.page.map((game) => (
						<li key={game._id}>
							<Link href={`/game/${game._id}`}>
								<Card className="flex items-center justify-between transition-colors hover:border-accent">
									<span className="capitalize">{game.mode}</span>
									<span className="text-muted">
										{game.winner === "draw"
											? "Draw"
											: game.winner
												? `${game.winner} won`
												: "Finished"}
									</span>
								</Card>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
