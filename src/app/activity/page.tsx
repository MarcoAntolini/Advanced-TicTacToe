"use client";

import { ActivityStats } from "@/components/activity/ActivityStats";
import { GameHistoryList } from "@/components/activity/GameHistoryList";
import { RatingHistory } from "@/components/activity/RatingHistory";
import { Card } from "@/components/ui/Card";
import { hasClerk } from "@/lib/clerk";
import { contentWidth } from "@/lib/layout";

export default function ActivityPage() {
	if (!hasClerk) {
		return (
			<div className={`${contentWidth.standard} space-y-4`}>
				<h1 className="text-3xl font-bold">Activity</h1>
				<Card>
					<p className="text-muted">
						Configure Clerk in <code className="text-sm">.env.local</code> to enable
						stats and game history.
					</p>
				</Card>
			</div>
		);
	}

	return (
		<div className={`${contentWidth.standard} space-y-8`}>
			<div>
				<h1 className="text-3xl font-bold">Activity</h1>
				<p className="mt-1 text-muted">Your record and past games.</p>
			</div>

			<ActivityStats />

			<section className="space-y-4" aria-label="Ranked rating history">
				<h2 className="text-lg font-semibold">Ranked history</h2>
				<RatingHistory />
			</section>

			<section className="space-y-4">
				<h2 className="text-lg font-semibold">Game history</h2>
				<GameHistoryList />
			</section>
		</div>
	);
}
