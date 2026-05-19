"use client";

import { SignedIn } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Link from "next/link";
import { ArrowRight, BarChart3 } from "lucide-react";
import { api } from "@convex/_generated/api";
import { DEFAULT_RATING } from "@shared/ratings/elo";
import { hasClerk } from "@/lib/clerk";
import { Card } from "@/components/ui/Card";

function StatsTeaserContent() {
	const profile = useQuery(api.users.queries.getProfile);

	if (profile === undefined || !profile) {
		return null;
	}

	const { wins, losses, draws, streak } = profile.stats;
	const rating = profile.rating ?? DEFAULT_RATING;
	const ratedGames = profile.ratedGames ?? 0;

	return (
		<section aria-label="Your record">
			<Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
						<BarChart3 className="h-5 w-5" aria-hidden />
					</div>
					<div>
						<p className="text-sm font-medium">Your record</p>
						<p className="mt-0.5 text-sm text-muted">
							{ratedGames > 0 ? (
								<>
									<span className="font-semibold text-accent">{rating}</span>
									<span className="mx-1.5 text-muted">Elo</span>
									<span className="text-muted">·</span>
								</>
							) : null}
							<span className="font-semibold text-success">{wins}</span>
							<span className="mx-1.5 text-muted">W</span>
							<span className="font-semibold text-danger">{losses}</span>
							<span className="mx-1.5 text-muted">L</span>
							<span className="font-semibold text-foreground">{draws}</span>
							<span className="mx-1.5 text-muted">D</span>
							<span className="text-muted">·</span>
							<span className="ml-1.5 font-semibold text-accent">{streak}</span>
							<span className="ml-1 text-muted">streak</span>
						</p>
					</div>
				</div>
				<Link
					href="/activity"
					className="inline-flex min-h-10 shrink-0 items-center gap-1.5 text-sm font-medium text-accent transition-opacity hover:opacity-80"
				>
					View activity
					<ArrowRight className="h-4 w-4 opacity-70" aria-hidden />
				</Link>
			</Card>
		</section>
	);
}

export function StatsTeaser() {
	if (!hasClerk) return null;

	return (
		<SignedIn>
			<StatsTeaserContent />
		</SignedIn>
	);
}
