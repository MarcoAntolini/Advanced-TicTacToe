import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import { contentWidth } from "@/lib/layout";

export default function LeaderboardPage() {
	return (
		<div className={`${contentWidth.standard} space-y-8`}>
			<section>
				<h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
				<p className="mt-2 text-pretty text-muted">
					Top players by Elo rating from ranked realtime matches. Casual and async games
					do not change rating.
				</p>
			</section>
			<section aria-label="Top rated players">
				<LeaderboardList />
			</section>
		</div>
	);
}
