"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { Gamepad2, ArrowRight } from "lucide-react";
import { api } from "@convex/_generated/api";
import { getGuestId } from "@/lib/guest";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function ActiveGamesList({
	compact = false,
	title = "My active games",
}: {
	compact?: boolean;
	title?: string;
}) {
	const guestId = getGuestId();
	const games = useQuery(api.games.queries.listMyActiveGames, { guestId });

	if (games === undefined) {
		return <p className="text-sm text-muted">Loading games…</p>;
	}

	if (games.length === 0) {
		if (compact) return null;
		return (
			<Card className="border-dashed">
				<p className="text-sm text-muted">
					No active games right now. Start one from Play or join a friend&apos;s room
					with a code.
				</p>
			</Card>
		);
	}

	return (
		<Card id="active-games">
			<div className="mb-3 flex items-center gap-2">
				<Gamepad2 className="h-5 w-5 text-accent" aria-hidden />
				<h2 className="text-lg font-semibold">{title}</h2>
			</div>
			<ul className="space-y-2">
				{games.map((game) => (
					<li key={game.gameId}>
						<Link
							href={`/game/${game.gameId}`}
							className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-border bg-bg px-3 py-2 transition-colors hover:border-accent hover:bg-surface-elevated"
						>
							<div className="min-w-0 text-left">
								<p className="font-medium capitalize text-foreground">
									{game.isRanked ? "ranked" : game.mode}
									{game.yourRole ? (
										<span className="ml-2 text-sm font-normal text-muted">
											playing as {game.yourRole}
										</span>
									) : null}
								</p>
								<p className="truncate text-sm text-muted">{game.statusLabel}</p>
							</div>
							<div className="flex shrink-0 items-center gap-2">
								{game.isYourTurn ? <Badge>Your turn</Badge> : null}
								{game.status === "waiting" && game.inviteCode ? (
									<span className="font-mono text-xs text-muted">{game.inviteCode}</span>
								) : null}
								<ArrowRight className="h-4 w-4 text-accent" aria-hidden />
							</div>
						</Link>
					</li>
				))}
			</ul>
			{!compact ? (
				<p className="mt-3 text-xs text-muted">
					You can only be in one active realtime match at a time. Async games can run in
					parallel.
				</p>
			) : null}
		</Card>
	);
}

export function ActiveGameBlockedBanner({ gameId }: { gameId: string }) {
	return (
		<Card
			role="alert"
			className="relative overflow-hidden border-playerO/30 bg-gradient-to-br from-playerO/10 via-surface to-surface"
		>
			<div
				className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-playerO"
				aria-hidden
			/>
			<div className="flex flex-col gap-4 pl-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex gap-4">
					<div
						className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-playerO/15 ring-1 ring-inset ring-playerO/25"
						aria-hidden
					>
						<Gamepad2 className="h-5 w-5 text-playerO" />
					</div>
					<div className="min-w-0">
						<span className="mb-2 inline-flex items-center rounded-full bg-playerO/15 px-2.5 py-0.5 text-xs font-medium text-playerO">
							Active match
						</span>
						<p className="font-semibold text-foreground">One game at a time</p>
						<p className="mt-1 text-sm leading-relaxed text-muted">
							Finish or forfeit your current realtime game before starting another.
						</p>
					</div>
				</div>
				<Link href={`/game/${gameId}`} className="shrink-0 sm:ml-2">
					<Button className="w-full gap-2 sm:w-auto">
						Resume game
						<ArrowRight className="h-4 w-4" aria-hidden />
					</Button>
				</Link>
			</div>
		</Card>
	);
}
