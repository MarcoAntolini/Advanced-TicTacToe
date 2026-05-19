"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Swords, ArrowRight } from "lucide-react";
import { api } from "@convex/_generated/api";
import { getGuestId } from "@/lib/guest";
import { useRankedMatchmakingQueue } from "@/hooks/useRankedMatchmakingQueue";
import { ActiveGameBlockedBanner } from "@/components/game/ActiveGamesList";
import { PlayBreadcrumb } from "@/components/layout/PlayBreadcrumb";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { contentWidth } from "@/lib/layout";

export default function RankedPlayPage() {
	const router = useRouter();
	const enqueue = useMutation(api.rankedMatchmaking.mutations.enqueue);
	const { inQueue, cancelSearch, cancelling } = useRankedMatchmakingQueue();
	const activeGames = useQuery(api.games.queries.listMyActiveGames, {
		guestId: getGuestId(),
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<string | null>(null);

	const blockingGame =
		activeGames?.find((g) => g.mode === "realtime" && g.status !== "finished") ?? null;
	const blocked = blockingGame != null;

	const handleMatch = async () => {
		if (blocked) return;
		setLoading(true);
		setError(null);
		setFeedback(null);
		try {
			const result = await enqueue({});
			if ("blocked" in result && result.blocked && result.gameId) {
				setFeedback(
					"You're already in a realtime game. Finish or forfeit it before starting another.",
				);
				return;
			}
			if ("inQueue" in result && result.inQueue) {
				setFeedback("Already searching — cancel from the header anytime.");
				return;
			}
			if (result.matched && result.gameId) {
				router.push(`/game/${result.gameId}`);
				return;
			}
			setFeedback(
				"Searching for a rated opponent. You can leave this page — cancel from the header anytime.",
			);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Matchmaking failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={`${contentWidth.standard} space-y-10`}>
			<PlayBreadcrumb label="Ranked" />
			<section>
				<h1 className="text-3xl font-bold tracking-tight">Ranked</h1>
				<p className="mt-2 text-pretty text-muted">
					Rated realtime matchmaking with a 5+3 Fischer clock. Wins and losses update your
					Elo; casual and async modes do not.
				</p>
			</section>

			{blocked && blockingGame ? (
				<ActiveGameBlockedBanner gameId={blockingGame.gameId} />
			) : null}

			<SignedOut>
				<Card className="border-dashed text-center">
					<p className="text-sm text-muted">
						Sign in from the header to play ranked and save your rating.
					</p>
				</Card>
			</SignedOut>

			<SignedIn>
				<Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
					<div className="flex flex-1 gap-4">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-elevated ring-1 ring-border">
							<Swords className="h-6 w-6 text-accent" aria-hidden />
						</div>
						<div>
							<h2 className="text-lg font-semibold">Find ranked match</h2>
							<p className="mt-1 text-sm text-muted">
								5 minutes per side plus 3 seconds added after each move. Timeout counts
								as a loss.
							</p>
						</div>
					</div>
					<div className="flex shrink-0 flex-col gap-2 sm:items-end">
						{inQueue ? (
							<Button
								variant="secondary"
								onClick={() => void cancelSearch()}
								loading={cancelling}
								className="w-full gap-2 sm:w-auto"
							>
								Cancel search
							</Button>
						) : (
							<Button
								onClick={() => void handleMatch()}
								loading={loading}
								disabled={blocked}
								className="w-full gap-2 sm:w-auto"
							>
								Find opponent
								<ArrowRight className="h-4 w-4 opacity-70" aria-hidden />
							</Button>
						)}
					</div>
				</Card>
			</SignedIn>

			{error ? (
				<p className="text-sm text-danger" role="alert">
					{error}
				</p>
			) : null}
			{feedback ? (
				<p className="text-sm text-muted" role="status">
					{feedback}
				</p>
			) : null}

			<p className="text-center text-sm text-muted">
				<Link href="/leaderboard" className="text-accent hover:underline">
					View leaderboard
				</Link>
			</p>
		</div>
	);
}
