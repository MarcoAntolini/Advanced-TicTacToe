import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Sparkles, Users, Zap } from "lucide-react";
import { StatsTeaser } from "@/components/activity/StatsTeaser";
import { ActiveGamesList } from "@/components/game/ActiveGamesList";
import { MetaBoardDiagram } from "@/components/rules/MetaBoardDiagram";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { heroTextWidth } from "@/lib/layout";

const modes = [
	{ label: "Local", icon: Users },
	{ label: "Realtime", icon: Zap },
	{ label: "Async", icon: Clock },
] as const;

export default function HomePage() {
	return (
		<div className="space-y-12">
			<section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface via-surface to-accent/12 px-6 py-10 sm:px-10 sm:py-12">
				<div
					className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accent/20 blur-3xl"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-playerX/10 blur-3xl"
					aria-hidden
				/>

				<div className="relative z-10 grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:gap-8 lg:gap-12">
					<div className={heroTextWidth}>
						<p className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
							<Sparkles className="h-3.5 w-3.5" aria-hidden />
							Ultimate Tic-Tac-Toe
						</p>
						<h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
							Nine boards.
							<span className="mt-1 block bg-gradient-to-r from-foreground via-foreground to-accent bg-clip-text text-transparent">
								One meta-game.
							</span>
						</h1>
						<p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
							Play on the couch, battle online in realtime, or take turns at your own pace —
							same rules everywhere.
						</p>
						<ul className="mt-6 flex flex-wrap gap-2" aria-label="Game modes">
							{modes.map(({ label, icon: Icon }) => (
								<li
									key={label}
									className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface-elevated/60 px-3 py-1.5 text-sm text-muted"
								>
									<Icon className="h-3.5 w-3.5 text-accent" aria-hidden />
									{label}
								</li>
							))}
						</ul>
					</div>

					<div className="flex justify-center md:justify-end">
						<MetaBoardDiagram
							className="max-w-[200px] sm:max-w-[220px] md:max-w-[240px] shadow-lg shadow-accent/5"
							showCaption={false}
						/>
					</div>
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
