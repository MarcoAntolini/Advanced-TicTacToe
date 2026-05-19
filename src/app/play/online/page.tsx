"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { Users, Zap, KeyRound } from "lucide-react";
import { api } from "@convex/_generated/api";
import { getGuestId } from "@/lib/guest";
import { useMatchmakingQueue } from "@/hooks/useMatchmakingQueue";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ActiveGameBlockedBanner } from "@/components/game/ActiveGamesList";
import { PlayBreadcrumb } from "@/components/layout/PlayBreadcrumb";
import { contentWidth } from "@/lib/layout";

function OnlinePlayContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const mode = (searchParams.get("mode") === "async" ? "async" : "realtime") as
		| "realtime"
		| "async";
	const isRealtime = mode === "realtime";

	const create = useMutation(api.games.mutations.create);
	const enqueue = useMutation(api.matchmaking.mutations.enqueue);
	const { inQueue, cancelSearch, cancelling } = useMatchmakingQueue();
	const activeGames = useQuery(api.games.queries.listMyActiveGames, {
		guestId: getGuestId(),
	});

	const [loading, setLoading] = useState<"invite" | "match" | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [matchFeedback, setMatchFeedback] = useState<string | null>(null);

	const guestId = getGuestId();

	const blockingRealtimeGame = useMemo(
		() => activeGames?.find((game) => game.mode === "realtime") ?? null,
		[activeGames],
	);
	const realtimeBlocked = isRealtime && blockingRealtimeGame != null;

	const handleInvite = async () => {
		if (realtimeBlocked) return;

		setLoading("invite");
		setError(null);
		setMatchFeedback(null);
		try {
			const result = await create({ mode, guestId });
			router.push(`/game/${result.gameId}`);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to create room");
		} finally {
			setLoading(null);
		}
	};

	const handleQuickMatch = async () => {
		if (realtimeBlocked) return;

		setLoading("match");
		setError(null);
		setMatchFeedback(null);
		try {
			const result = await enqueue({ guestId });
			if ("blocked" in result && result.blocked && result.gameId) {
				setMatchFeedback(
					"You're already in a realtime game. Finish or forfeit it before starting another.",
				);
				return;
			}
			if ("inQueue" in result && result.inQueue) {
				setMatchFeedback("Already searching — check the header for status or cancel.");
				return;
			}
			if (result.matched && result.gameId) {
				router.push(`/game/${result.gameId}`);
				return;
			}
			setMatchFeedback("Searching for an opponent. You can leave this page — cancel from the header anytime.");
		} catch (e) {
			setMatchFeedback(e instanceof Error ? e.message : "Matchmaking failed");
		} finally {
			setLoading(null);
		}
	};

	const modeLabel = mode === "realtime" ? "Realtime" : "Async";

	return (
		<div className={`${contentWidth.standard} space-y-10`}>
			<PlayBreadcrumb label={modeLabel} />
			<section>
				<h1 className="text-3xl font-bold tracking-tight">{modeLabel}</h1>
				<p className="mt-2 text-pretty text-muted">
					{isRealtime
						? "Find a random opponent or invite a friend to a private room."
						: "Create a room and share a link — take turns whenever you're ready."}
				</p>
			</section>

			{error ? (
				<p className="rounded-md bg-danger/20 px-3 py-2 text-sm text-danger" role="alert">
					{error}
				</p>
			) : null}

			{isRealtime && blockingRealtimeGame ? (
				<ActiveGameBlockedBanner gameId={blockingRealtimeGame.gameId} />
			) : null}

			<section className="grid gap-4" aria-label={`${modeLabel} options`}>
				{isRealtime ? (
					<Card
						className={`flex flex-col gap-4 sm:flex-row sm:items-center${realtimeBlocked ? " opacity-60" : ""}`}
						aria-disabled={realtimeBlocked || undefined}
					>
						<div className="flex flex-1 gap-4">
							<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-elevated ring-1 ring-border">
								<Zap className="h-6 w-6 text-playerX" aria-hidden />
							</div>
							<div className="min-w-0 flex-1">
								<h2 className="text-lg font-semibold">Find random opponent</h2>
								<p className="mt-1 text-sm text-muted">
									Get paired with someone online right now.
								</p>
								{inQueue ? (
									<p className="mt-3 text-sm text-muted" role="status">
										Searching for an opponent. You can leave this page — use{" "}
										<span className="text-foreground">Cancel</span> in the header to stop.
									</p>
								) : matchFeedback ? (
									<p
										className="mt-3 rounded-md bg-surface-elevated px-3 py-2 text-sm text-foreground"
										role="status"
									>
										{matchFeedback}
									</p>
								) : null}
							</div>
						</div>
						<div className="shrink-0">
							{inQueue && !realtimeBlocked ? (
								<Button
									type="button"
									variant="secondary"
									onClick={() => void cancelSearch()}
									loading={cancelling}
									className="w-full sm:hidden"
								>
									Cancel search
								</Button>
							) : (
								<Button
									type="button"
									onClick={() => void handleQuickMatch()}
									loading={loading === "match"}
									disabled={realtimeBlocked}
									className="w-full sm:w-auto"
								>
									Quick match
								</Button>
							)}
						</div>
					</Card>
				) : null}

				<Card
					className={`flex flex-col gap-4 sm:flex-row sm:items-center${realtimeBlocked ? " opacity-60" : ""}`}
					aria-disabled={realtimeBlocked || undefined}
				>
					<div className="flex flex-1 gap-4">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-elevated ring-1 ring-border">
							<Users className="h-6 w-6 text-accent" aria-hidden />
						</div>
						<div>
							<h2 className="text-lg font-semibold">Invite a friend</h2>
							<p className="mt-1 text-sm text-muted">
								Create a private room and share a link or code.
							</p>
						</div>
					</div>
					<Button
						onClick={handleInvite}
						loading={loading === "invite"}
						disabled={realtimeBlocked}
						variant={isRealtime ? "secondary" : "primary"}
						className="w-full shrink-0 sm:w-auto"
					>
						Create room
					</Button>
				</Card>
			</section>

			<Card className="flex flex-col items-center gap-4 border-dashed text-center sm:flex-row sm:text-left">
				<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-elevated">
					<KeyRound className="h-6 w-6 text-muted" aria-hidden />
				</div>
				<div className="flex-1">
					<h2 className="font-semibold">Have a room code?</h2>
					<p className="mt-1 text-sm text-muted">
						Your friend already created a room — join with their code or link.
					</p>
				</div>
				<Link href="/join" className="w-full sm:w-auto">
					<Button variant="ghost" className="w-full">
						Join with code
					</Button>
				</Link>
			</Card>
		</div>
	);
}

export default function OnlinePlayPage() {
	return (
		<Suspense fallback={<p className="text-muted">Loading…</p>}>
			<OnlinePlayContent />
		</Suspense>
	);
}
