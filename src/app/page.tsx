import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { StatsTeaser } from "@/components/activity/StatsTeaser";
import { ActiveGamesList } from "@/components/game/ActiveGamesList";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { heroTextWidth } from "@/lib/layout";

export default function HomePage() {
	return (
		<div className="space-y-12">
			<section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface via-surface to-accent/10 px-6 py-10 text-center sm:px-10 sm:text-left">
				<div className={`relative z-10 mx-auto ${heroTextWidth} sm:mx-0`}>
					<p className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
						<Sparkles className="h-3.5 w-3.5" aria-hidden />
						Ultimate Tic-Tac-Toe
					</p>
					<h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
						Nine boards. One meta-game.
					</h1>
					<p className="mt-4 text-lg text-muted">
						Play locally, battle online in realtime, or take turns async — all in one
						place. Use <span className="text-foreground">Play</span> in the header to
						start a game.
					</p>
				</div>
			</section>

			<StatsTeaser />

			<section id="active-games" className="scroll-mt-24">
				<div className="mb-4 flex items-end justify-between gap-4">
					<div>
						<h2 className="text-xl font-semibold">Continue playing</h2>
						<p className="mt-1 text-sm text-muted">
							Resume waiting rooms and in-progress matches.
						</p>
					</div>
				</div>
				<ActiveGamesList title="Active games" />
			</section>

			<section>
				<Card className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
					<div className="flex-1">
						<h2 className="text-lg font-semibold">New to Ultimate TTT?</h2>
						<p className="mt-1 text-sm text-muted">
							Learn how the nine-board meta-game works, then pick local, realtime, or
							async from Play. Sign in from the header to save stats and history.
						</p>
					</div>
					<Link href="/rules" className="shrink-0">
						<Button variant="secondary" className="gap-2">
							<BookOpen className="h-4 w-4 opacity-80" aria-hidden />
							Read the rules
							<ArrowRight className="h-4 w-4 opacity-70" aria-hidden />
						</Button>
					</Link>
				</Card>
			</section>
		</div>
	);
}
