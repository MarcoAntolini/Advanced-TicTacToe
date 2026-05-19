"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import { DEFAULT_RATING } from "@shared/ratings/elo";
import { Avatar } from "@/components/ui/Avatar";
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

export function LeaderboardList() {
	const rows = useQuery(api.ratings.queries.listLeaderboard, { limit: 50 });
	const myContext = useQuery(api.ratings.queries.getMyRankContext);
	const season = useQuery(api.ratings.queries.getSeason);

	if (rows === undefined || season === undefined) {
		return <p className="text-sm text-muted">Loading leaderboard…</p>;
	}

	if (rows.length === 0) {
		return (
			<Card className="border-dashed text-center">
				<p className="text-sm text-muted">
					No players on the {season.label} board yet. Play at least {season.leaderboardMinGames}{" "}
					ranked games to qualify.
				</p>
			</Card>
		);
	}

	return (
		<Card className="overflow-hidden p-0">
			<div className="border-b border-border px-4 py-3">
				<p className="text-sm font-medium text-foreground">{season.label}</p>
				<p className="text-xs text-muted">
					Top rated players with {season.leaderboardMinGames}+ ranked games
				</p>
			</div>
			<Table>
				<TableHeader>
					<TableRow className="hover:bg-transparent">
						<TableHead className="w-12">#</TableHead>
						<TableHead>Player</TableHead>
						<TableHead className="hidden text-right sm:table-cell">Games</TableHead>
						<TableHead className="text-right">Rating</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.map((row) => {
						const isMe = myContext && row.userId === myContext.userId;
						return (
							<TableRow
								key={row.userId}
								className={cn(isMe && "bg-accent/10")}
							>
								<TableCell className="font-mono text-sm text-muted">
									{row.rank}
								</TableCell>
								<TableCell>
									<div className="flex min-w-0 items-center gap-3">
										<Avatar
											name={row.displayName}
											src={row.avatarUrl}
											size={36}
										/>
										<div className="min-w-0">
											<p className="truncate font-medium text-foreground">
												{row.displayName}
												{isMe ? (
													<span className="ml-2 text-xs font-normal text-accent">
														(you)
													</span>
												) : null}
											</p>
											<p className="text-xs text-muted sm:hidden">
												{row.ratedGames} ranked games
											</p>
										</div>
									</div>
								</TableCell>
								<TableCell className="hidden text-right text-muted sm:table-cell">
									{row.ratedGames}
								</TableCell>
								<TableCell className="text-right font-mono text-lg font-semibold tabular-nums text-accent">
									{row.rating ?? DEFAULT_RATING}
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
			{myContext ? (
				<p className="border-t border-border px-4 py-3 text-center text-xs text-muted">
					Your rating:{" "}
					<span className="font-semibold text-foreground">{myContext.rating}</span>
					{myContext.onLeaderboard && myContext.rank ? (
						<>
							{" · "}
							Rank #{myContext.rank}
						</>
					) : myContext.gamesUntilLeaderboard > 0 ? (
						<>
							{" · "}
							{myContext.gamesUntilLeaderboard} more ranked{" "}
							{myContext.gamesUntilLeaderboard === 1 ? "game" : "games"} to appear on the
							board
						</>
					) : null}
				</p>
			) : (
				<p className="border-t border-border px-4 py-3 text-center text-xs text-muted">
					<Link href="/play/ranked" className="text-accent hover:underline">
						Sign in and play ranked
					</Link>{" "}
					to earn a rating.
				</p>
			)}
		</Card>
	);
}
