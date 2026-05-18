import Link from "next/link";
import { Users, Zap, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SignedInDashboard } from "@/components/home/SignedInDashboard";

export default function HomePage() {
	return (
		<div className="space-y-10">
			<section className="text-center">
				<h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
					Ultimate Tic-Tac-Toe
				</h1>
				<p className="mx-auto mt-4 max-w-xl text-lg text-muted">
					Nine boards, one meta-game. Play locally, battle online in realtime, or take
					your turns async.
				</p>
			</section>

			<section className="grid gap-4 sm:grid-cols-3">
				<Card className="flex flex-col">
					<Users className="mb-3 h-8 w-8 text-accent" aria-hidden />
					<h2 className="text-lg font-semibold">Local</h2>
					<p className="mt-2 flex-1 text-sm text-muted">
						Pass-and-play on one device. Perfect for couch co-op.
					</p>
					<Link href="/play/local" className="mt-4">
						<Button className="w-full">Play local</Button>
					</Link>
				</Card>
				<Card className="flex flex-col">
					<Zap className="mb-3 h-8 w-8 text-playerX" aria-hidden />
					<h2 className="text-lg font-semibold">Realtime</h2>
					<p className="mt-2 flex-1 text-sm text-muted">
						Quick match or invite a friend with a room code.
					</p>
					<Link href="/play/online?mode=realtime" className="mt-4">
						<Button className="w-full">Play realtime</Button>
					</Link>
				</Card>
				<Card className="flex flex-col">
					<Clock className="mb-3 h-8 w-8 text-playerO" aria-hidden />
					<h2 className="text-lg font-semibold">Async</h2>
					<p className="mt-2 flex-1 text-sm text-muted">
						Make moves on your schedule. 72h per turn.
					</p>
					<Link href="/play/online?mode=async" className="mt-4">
						<Button variant="secondary" className="w-full">
							Play async
						</Button>
					</Link>
				</Card>
			</section>

			<SignedInDashboard />
		</div>
	);
}
