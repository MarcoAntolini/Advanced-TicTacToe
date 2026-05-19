"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { isForfeitWin } from "@shared/game/engine";
import { Card } from "@/components/ui/Card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

function formatResult(game: Doc<"games">): string {
	if (game.winner === "draw") return "Draw";
	if (!game.winner) return "Finished";
	if (
		isForfeitWin(
			{
				...game.state,
				boards: game.state.boards.map((b) => [...b]),
				meta: [...game.state.meta],
				moves: [...game.state.moves],
			},
			game.winner,
		)
	) {
		return `${game.winner} won (forfeit)`;
	}
	return `${game.winner} won`;
}

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
		<Card className="overflow-hidden p-0">
			<Table>
				<TableHeader>
					<TableRow className="hover:bg-transparent">
						<TableHead>Mode</TableHead>
						<TableHead className="text-right">Result</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{history.page.map((game) => (
						<TableRow key={game._id} className="cursor-pointer p-0 hover:bg-transparent">
							<TableCell className="p-0" colSpan={2}>
								<Link
									href={`/game/${game._id}`}
									className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-surface-elevated/50"
								>
									<span className="font-medium capitalize">{game.mode}</span>
									<span className="text-sm text-muted">{formatResult(game)}</span>
								</Link>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Card>
	);
}
