"use client";

import { useState } from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useBlockingRealtimeGame } from "@/hooks/useBlockingRealtimeGame";
import {
	AUTO_FIND_ACTIONS,
	MULTIPLAYER_UTILITIES,
	PLAY_FLOW_COPY,
} from "@/lib/play/playFlowConfig";
import type { AutoFindActionId } from "@/lib/play/types";
import { usePlayActions } from "@/hooks/usePlayActions";
import { useMatchmakingQueue } from "@/hooks/useMatchmakingQueue";
import { ActiveGameBlockedBanner } from "@/components/game/ActiveGamesList";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { JoinCodeInline } from "@/components/play/JoinCodeInline";
import { PublicGamesModal } from "@/components/play/PublicGamesModal";

export function PlayStepMultiplayer({
	onCreate,
	onBack,
}: {
	onCreate: () => void;
	onBack: () => void;
}) {
	const [publicModalOpen, setPublicModalOpen] = useState(false);
	const { loadingAction, error, statusMessage, runAutoFind } = usePlayActions();
	const { inQueueRealtime, inQueueAsync, cancelSearch, cancelling } = useMatchmakingQueue();
	const { blockingGame: blockingRealtimeGame, blocked: realtimeBlocked } =
		useBlockingRealtimeGame();

	const isQueued = (id: AutoFindActionId) => {
		if (id === "quick") return inQueueRealtime;
		if (id === "async") return inQueueAsync;
		return false;
	};

	return (
		<>
			<section className="text-center sm:text-left">
				<Button variant="ghost" onClick={onBack} className="mb-4 -ml-2 h-auto min-h-0 px-2 py-1 text-sm">
					← Back
				</Button>
				<h1 className="text-3xl font-bold tracking-tight">{PLAY_FLOW_COPY.multiplayerTitle}</h1>
				<p className="mt-2 text-pretty text-muted">{PLAY_FLOW_COPY.multiplayerSubtitle}</p>
			</section>

			{error ? (
				<p className="rounded-md bg-danger/20 px-3 py-2 text-sm text-danger" role="alert">
					{error}
				</p>
			) : null}
			{statusMessage ? (
				<p className="text-sm text-muted" role="status">
					{statusMessage}
				</p>
			) : null}

			{realtimeBlocked && blockingRealtimeGame ? (
				<ActiveGameBlockedBanner gameId={blockingRealtimeGame.gameId} />
			) : null}

			<section aria-label={PLAY_FLOW_COPY.autoFindHeading}>
				<h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
					{PLAY_FLOW_COPY.autoFindHeading}
				</h2>
				<div className="grid gap-3">
					{AUTO_FIND_ACTIONS.map((action) => {
						const Icon = action.icon;
						const queued = isQueued(action.id);
						const needsAuth = action.requiresAuth;

						const card = (
							<Card
								key={action.id}
								className={`flex flex-col gap-4 sm:flex-row sm:items-center${realtimeBlocked && action.id !== "async" ? " opacity-60" : ""}`}
							>
								<div className="flex flex-1 gap-4">
									<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-elevated ring-1 ring-border">
										<Icon className={`h-6 w-6 ${action.iconClass}`} aria-hidden />
									</div>
									<div>
										<h3 className="text-lg font-semibold">{action.title}</h3>
										<p className="mt-1 text-sm text-muted">{action.description}</p>
									</div>
								</div>
								{queued ? (
									<Button
										variant="secondary"
										onClick={() => void cancelSearch(action.queueMode)}
										loading={cancelling}
										className="w-full sm:hidden"
									>
										Cancel search
									</Button>
								) : (
									<Button
										onClick={() => void runAutoFind(action.id)}
										loading={loadingAction === action.id}
										disabled={
											realtimeBlocked &&
											(action.id === "quick" || action.id === "ranked")
										}
										variant={action.id === "quick" ? "primary" : "secondary"}
										className="w-full gap-2 sm:w-auto"
									>
										{action.id === "ranked" ? "Find opponent" : "Find match"}
										<ArrowRight className="h-4 w-4 opacity-70" aria-hidden />
									</Button>
								)}
							</Card>
						);

						if (needsAuth) {
							return (
								<div key={action.id}>
									<SignedOut>
										<Card className="border-dashed opacity-80">{card}</Card>
										<p className="mt-2 text-center text-sm text-muted sm:text-left">
											<Link href="/sign-in" className="text-accent hover:underline">
												Sign in
											</Link>{" "}
											to play ranked.
										</p>
									</SignedOut>
									<SignedIn>{card}</SignedIn>
								</div>
							);
						}

						return card;
					})}
				</div>
			</section>

			<section className="grid gap-4" aria-label="More options">
				{MULTIPLAYER_UTILITIES.filter((u) => u.kind !== "inline").map((item) => {
					const Icon = item.icon;
					return (
						<Card
							key={item.id}
							className="flex flex-col gap-4 sm:flex-row sm:items-center"
						>
							<div className="flex flex-1 gap-4">
								<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-elevated ring-1 ring-border">
									<Icon className={`h-6 w-6 ${item.iconClass}`} aria-hidden />
								</div>
								<div>
									<h3 className="text-lg font-semibold">{item.title}</h3>
									<p className="mt-1 text-sm text-muted">{item.description}</p>
								</div>
							</div>
							<Button
								variant="secondary"
								className="w-full sm:w-auto"
								onClick={
									item.id === "browse"
										? () => setPublicModalOpen(true)
										: onCreate
								}
							>
								{item.id === "browse" ? "Browse" : "Create"}
							</Button>
						</Card>
					);
				})}
			</section>

			<section aria-label="Join with code">
				<h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
					Join with code
				</h2>
				<JoinCodeInline />
			</section>

			<PublicGamesModal open={publicModalOpen} onClose={() => setPublicModalOpen(false)} />
		</>
	);
}
