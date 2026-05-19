import Link from "next/link";
import { Users, Zap, Clock, KeyRound, ArrowRight, Swords } from "lucide-react";
import { ActiveGamesList } from "@/components/game/ActiveGamesList";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { contentWidth } from "@/lib/layout";

const modes = [
	{
		href: "/play/local",
		title: "Local",
		description: "Pass-and-play on one device. Perfect for couch co-op.",
		icon: Users,
		iconClass: "text-accent",
		cta: "Play local",
		variant: "secondary" as const,
	},
	{
		href: "/play/online?mode=realtime",
		title: "Realtime",
		description: "Quick match or invite a friend. Play live, move by move.",
		icon: Zap,
		iconClass: "text-playerX",
		cta: "Play realtime",
		variant: "primary" as const,
	},
	{
		href: "/play/online?mode=async",
		title: "Async",
		description: "Take turns on your schedule. Up to 72 hours per move.",
		icon: Clock,
		iconClass: "text-playerO",
		cta: "Play async",
		variant: "secondary" as const,
	},
	{
		href: "/play/ranked",
		title: "Ranked",
		description: "Rated quick match with a 5+3 clock. Sign in required.",
		icon: Swords,
		iconClass: "text-accent",
		cta: "Play ranked",
		variant: "secondary" as const,
	},
];

export default function PlayHubPage() {
	return (
		<div className={`${contentWidth.standard} space-y-10`}>
			<section className="text-center sm:text-left">
				<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Play</h1>
				<p className="mt-2 text-pretty text-muted">
					Pick how you want to play. Local stays on your device; online modes use
					rooms, codes, or quick match.
				</p>
			</section>

			<section aria-label="Continue playing">
				<ActiveGamesList compact title="Continue playing" />
			</section>

			<section className="grid gap-4">
				{modes.map((mode) => {
					const Icon = mode.icon;
					return (
						<Card
							key={mode.href}
							className="group flex flex-col gap-4 transition-colors hover:border-accent/40 sm:flex-row sm:items-center"
						>
							<div className="flex flex-1 gap-4">
								<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-elevated ring-1 ring-border">
									<Icon className={`h-6 w-6 ${mode.iconClass}`} aria-hidden />
								</div>
								<div>
									<h2 className="text-lg font-semibold">{mode.title}</h2>
									<p className="mt-1 text-sm text-muted">{mode.description}</p>
								</div>
							</div>
							<Link href={mode.href} className="shrink-0">
								<Button variant={mode.variant} className="w-full gap-2 sm:w-auto">
									{mode.cta}
									<ArrowRight className="h-4 w-4 opacity-70" aria-hidden />
								</Button>
							</Link>
						</Card>
					);
				})}
			</section>

			<Card className="flex flex-col items-center gap-4 border-dashed text-center sm:flex-row sm:text-left">
				<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-elevated">
					<KeyRound className="h-6 w-6 text-muted" aria-hidden />
				</div>
				<div className="flex-1">
					<h2 className="font-semibold">Join a friend&apos;s room</h2>
					<p className="mt-1 text-sm text-muted">
						Already have a link or 6-character code? Enter it here.
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
