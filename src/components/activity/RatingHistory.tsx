"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import { Card } from "@/components/ui/Card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function RatingHistory() {
	const history = useQuery(api.ratings.queries.listMyRatingHistory, { limit: 20 });
	const season = useQuery(api.ratings.queries.getSeason);

	if (history === undefined || season === undefined) {
		return <p className="text-sm text-muted">Loading rating history…</p>;
	}

	if (history.length === 0) {
		return (
			<Card className="border-dashed">
				<p className="text-sm text-muted">
					No ranked games in {season.label} yet.{" "}
					<Link href="/play/ranked" className="text-accent hover:underline">
						Play ranked
					</Link>{" "}
					to start your rating history.
				</p>
			</Card>
		);
	}

	const ratings = [...history].reverse().map((h) => h.ratingAfter);
	const min = Math.min(...ratings);
	const max = Math.max(...ratings);
	const range = Math.max(max - min, 1);

	return (
		<Card>
			<div className="mb-4 flex flex-wrap items-end justify-between gap-2">
				<div>
					<h2 className="font-medium">Rating history</h2>
					<p className="text-xs text-muted">{season.label} · newest first below</p>
				</div>
			</div>

			<div
				className="mb-6 flex h-24 items-end gap-0.5 rounded-lg bg-surface-elevated px-2 py-2"
				role="img"
				aria-label={`Rating trend from ${ratings[0]} to ${ratings[ratings.length - 1]}`}
			>
				{ratings.map((rating, i) => {
					const height = ((rating - min) / range) * 100;
					return (
						<div
							key={`${rating}-${i}`}
							className="min-w-[4px] flex-1 rounded-sm bg-accent/80"
							style={{ height: `${Math.max(8, height)}%` }}
							title={`${rating}`}
						/>
					);
				})}
			</div>

			<div className="max-h-64 overflow-y-auto rounded-md border border-border">
				<Table>
					<TableHeader>
						<TableRow className="hover:bg-transparent">
							<TableHead>Match</TableHead>
							<TableHead className="hidden sm:table-cell">Date</TableHead>
							<TableHead className="text-right">Δ</TableHead>
							<TableHead className="text-right">Rating</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{history.map((row) => (
							<TableRow key={row.gameId}>
								<TableCell className="py-2">
									<p className="truncate font-medium capitalize text-foreground">
										{row.result} vs {row.opponentName}
									</p>
									<p className="text-xs text-muted sm:hidden">
										{new Date(row.appliedAt).toLocaleDateString(undefined, {
											month: "short",
											day: "numeric",
										})}
									</p>
								</TableCell>
								<TableCell className="hidden py-2 text-muted sm:table-cell">
									{new Date(row.appliedAt).toLocaleDateString(undefined, {
										month: "short",
										day: "numeric",
									})}
								</TableCell>
								<TableCell className="py-2 text-right">
									<span
										className={cn(
											"font-mono font-semibold tabular-nums",
											row.delta > 0
												? "text-success"
												: row.delta < 0
													? "text-danger"
													: "text-muted",
										)}
									>
										{row.delta > 0 ? "+" : ""}
										{row.delta}
									</span>
								</TableCell>
								<TableCell className="py-2 text-right font-mono text-xs tabular-nums text-muted">
									{row.ratingAfter}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</Card>
	);
}
