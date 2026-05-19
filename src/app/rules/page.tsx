import Link from "next/link";
import {
	ArrowRight,
	CornerDownRight,
	Grid3x3,
	MoveRight,
	Sparkles,
	Target,
	Trophy,
} from "lucide-react";
import { MetaBoardDiagram } from "@/components/rules/MetaBoardDiagram";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { contentWidth, heroTextWidth } from "@/lib/layout";

const turnSteps = [
	{
		step: 1,
		title: "Play in the active board",
		body: "On your turn, place X or O in any empty cell on the small board you must use. X goes first; the first move can be on any board.",
		icon: Grid3x3,
	},
	{
		step: 2,
		title: "Send your opponent",
		body: "The cell you pick sets where they go next — the small board in the same position on the meta-grid.",
		icon: MoveRight,
	},
	{
		step: 3,
		title: "Free move if blocked",
		body: "If that board is already won or full, they may play on any open board instead.",
		icon: CornerDownRight,
	},
];

export default function RulesPage() {
	return (
		<div className={`${contentWidth.prose} space-y-14 pb-4`}>
			{/* Hero */}
			<section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface via-surface to-accent/15 px-6 py-10 sm:px-10">
				<div className={`relative z-10 ${heroTextWidth}`}>
					<p className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
						<Sparkles className="h-3.5 w-3.5" aria-hidden />
						Rules
					</p>
					<h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
						How to play Ultimate TTT
					</h1>
					<p className="mt-3 text-lg text-muted">
						Win tic-tac-toe on the big board by winning three small boards in a row.
						Same rules in local, realtime, and async modes.
					</p>
				</div>
			</section>

			{/* Overview: diagram + goal */}
			<section className="grid gap-8 lg:grid-cols-[minmax(0,240px)_1fr] lg:items-center">
				<div className="flex justify-center lg:justify-start">
					<MetaBoardDiagram />
				</div>
				<div className="space-y-4">
					<h2 className="text-xl font-semibold sm:text-2xl">The big picture</h2>
					<ul className="space-y-3 text-muted">
						<li className="flex gap-3">
							<span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
								1
							</span>
							<span>
								The game is a <strong className="font-medium text-foreground">3×3 grid of small</strong> tic-tac-toe boards.
							</span>
						</li>
						<li className="flex gap-3">
							<span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
								2
							</span>
							<span>
								Win a small board with three in a row; it counts as <strong className="font-medium text-foreground">your mark</strong> on the meta-grid.
							</span>
						</li>
						<li className="flex gap-3">
							<span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
								3
							</span>
							<span>
								Win the game with <strong className="font-medium text-foreground">three claimed small boards in a row</strong> on the meta-board.
							</span>
						</li>
					</ul>
				</div>
			</section>

			{/* Turn flow */}
			<section className="space-y-6">
				<div>
					<h2 className="text-xl font-semibold sm:text-2xl">Each turn</h2>
					<p className="mt-1 text-sm text-muted">
						Three steps — the send rule is what makes Ultimate TTT different.
					</p>
				</div>
				<ol className="grid gap-4 md:grid-cols-3">
					{turnSteps.map(({ step, title, body, icon: Icon }) => (
						<li key={step}>
							<Card className="relative h-full border-border/80 pt-8">
								<span
									className="absolute left-6 top-0 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-sm font-bold text-white shadow-md"
									aria-hidden
								>
									{step}
								</span>
								<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-elevated ring-1 ring-border">
									<Icon className="h-5 w-5 text-accent" aria-hidden />
								</div>
								<h3 className="font-semibold">{title}</h3>
								<p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
							</Card>
						</li>
					))}
				</ol>
			</section>

			{/* Highlight: send rule */}
			<section
				className="rounded-2xl border border-accent/35 bg-gradient-to-r from-accent/10 via-surface to-surface px-6 py-6 sm:px-8"
				aria-labelledby="send-rule-heading"
			>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
					<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/20 ring-1 ring-accent/30">
						<Target className="h-6 w-6 text-accent" aria-hidden />
					</div>
					<div>
						<h2 id="send-rule-heading" className="text-lg font-semibold">
							Remember the send rule
						</h2>
						<p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
							Pick top-left on a small board → opponent must play on the{" "}
							<strong className="text-foreground">top-left small board</strong> next.
							Pick center → they go to the center board. This chain is the heart of the
							game — use it to force opponents into bad positions.
						</p>
					</div>
				</div>
			</section>

			{/* Winning */}
			<section className="space-y-6">
				<div>
					<h2 className="text-xl font-semibold sm:text-2xl">How you win</h2>
					<p className="mt-1 text-sm text-muted">Two levels of victory, one match result.</p>
				</div>
				<div className="grid gap-4 sm:grid-cols-2">
					<Card className="border-playerX/25 bg-playerX/5">
						<div className="mb-3 inline-flex items-center gap-2 rounded-full bg-playerX/15 px-2.5 py-0.5 text-xs font-medium text-playerX">
							Small board
						</div>
						<h3 className="font-semibold">Claim a board</h3>
						<p className="mt-2 text-sm leading-relaxed text-muted">
							Three in a row on one small board wins it for you on the meta-grid. A full
							board with no winner is closed — nobody owns it, and it cannot be played
							again.
						</p>
					</Card>
					<Card className="border-playerO/25 bg-playerO/5">
						<div className="mb-3 inline-flex items-center gap-2 rounded-full bg-playerO/15 px-2.5 py-0.5 text-xs font-medium text-playerO">
							Meta-board
						</div>
						<div className="mb-2 flex items-center gap-2">
							<Trophy className="h-5 w-5 text-playerO" aria-hidden />
							<h3 className="font-semibold">Win the match</h3>
						</div>
						<p className="text-sm leading-relaxed text-muted">
							Three claimed small boards in a row on the meta-grid wins the game. If no
							legal moves remain and neither side has won the meta-game, the match is a
							draw.
						</p>
					</Card>
				</div>
			</section>

			{/* Ranked & rating */}
			<section className="space-y-4">
				<div>
					<h2 className="text-xl font-semibold sm:text-2xl">Ranked play &amp; Elo</h2>
					<p className="mt-1 text-sm text-muted">
						Signed-in quick matches with ratings, matchmaking, and season standings.
					</p>
				</div>
				<Card>
					<ul className="space-y-3 text-sm leading-relaxed text-muted">
						<li>
							<strong className="font-medium text-foreground">Ranked</strong> is a
							signed-in quick match on a <strong className="font-medium text-foreground">5+3 Fischer clock</strong> — five minutes per player, plus three seconds added each move. Forfeiting or running out of time counts as a loss.
						</li>
						<li>
							Everyone starts at <strong className="font-medium text-foreground">1200 Elo</strong>.
							Wins, losses, and draws against rated opponents move both ratings (K=32).
							Casual realtime and async games do not affect your rating.
						</li>
						<li>
							Matchmaking looks for opponents within{" "}
							<strong className="font-medium text-foreground">±200 rating</strong> first, then
							widens the range by 50 every ten seconds you wait.
						</li>
						<li>
							The public leaderboard lists players with at least{" "}
							<strong className="font-medium text-foreground">five ranked games</strong> in the
							current season. Track your rating trend on{" "}
							<Link href="/activity" className="font-medium text-accent hover:underline">
								Activity
							</Link>
							.
						</li>
					</ul>
					<p className="mt-4 text-sm">
						<Link href="/play/ranked" className="font-medium text-accent hover:underline">
							Play ranked
						</Link>
						<span className="text-muted"> · </span>
						<Link href="/leaderboard" className="font-medium text-accent hover:underline">
							Leaderboard
						</Link>
					</p>
				</Card>
			</section>

			{/* CTA */}
			<section className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-8 text-center sm:flex-row sm:text-left">
				<div className="flex-1">
					<p className="font-semibold">Ready to try it?</p>
					<p className="mt-1 text-sm text-muted">
						Local, realtime, async, and ranked all use the same board rules above.
					</p>
				</div>
				<Link href="/play" className="shrink-0">
					<Button className="gap-2">
						Go to Play
						<ArrowRight className="h-4 w-4" aria-hidden />
					</Button>
				</Link>
			</section>
		</div>
	);
}
