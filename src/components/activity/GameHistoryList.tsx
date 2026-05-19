"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import { isForfeitWin } from "@shared/game/engine";
import { Card } from "@/components/ui/Card";

export function GameHistoryList() {
	const history = useQuery(api.games.queries.listHistory, {
		paginationOpts: { numItems: 20, cursor: null },
	});

	if (history === undefined) {
		return <p className="text-sm text-muted">Loading history…</p>;
	}

	if (history.page.length === 0) {
		return (
			<Card className="border-dashed">
				<p className="text-sm text-muted">
					No finished games yet. Head to Play to start your first match.
				</p>
			</Card>
		);
	}

	return (
		<ul className="space-y-2">
			{history.page.map((game) => (
				<li key={game._id}>
					<Link href={`/game/${game._id}`}>
						<Card className="flex items-center justify-between transition-colors hover:border-accent">
							<span className="capitalize font-medium">{game.mode}</span>
							<span className="text-sm text-muted">
								{game.winner === "draw"
									? "Draw"
									: game.winner
										? isForfeitWin(
												{
													...game.state,
													boards: game.state.boards.map((b) => [...b]),
													meta: [...game.state.meta],
													moves: [...game.state.moves],
												},
												game.winner,
											)
											? `${game.winner} won (forfeit)`
											: `${game.winner} won`
										: "Finished"}
							</span>
						</Card>
					</Link>
				</li>
			))}
		</ul>
	);
}
