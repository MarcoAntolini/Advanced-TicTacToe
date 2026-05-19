import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import { contentWidth } from "@/lib/layout";

export default function LeaderboardPage() {
	return (
		<div className={`${contentWidth.standard} space-y-8`}>
			<section>
				<h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
				<p className="mt-2 text-pretty text-muted">
					Season 1 standings for players with at least five ranked games. Ratings use
					standard Elo (start 1200); only ranked realtime affects your score.
				</p>
			</section>
			<section aria-label="Top rated players">
				<LeaderboardList />
			</section>
		</div>
	);
}
