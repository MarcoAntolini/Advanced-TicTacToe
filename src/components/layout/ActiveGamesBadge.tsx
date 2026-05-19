"use client";

import { useQuery } from "convex/react";
import { usePathname } from "next/navigation";
import { api } from "@convex/_generated/api";
import { getGuestId } from "@/lib/guest";

/** Waiting rooms (no opponent yet) are listed on /play but do not need a nav nudge. */
function gamesForBadge<T extends { status: string }>(games: T[]) {
	return games.filter((g) => g.status !== "waiting");
}

function activeGamesBadgeLabel(gamesLength: number, yourTurn: number) {
	if (yourTurn > 0) {
		return `${yourTurn} active game${yourTurn === 1 ? "" : "s"} waiting for your move`;
	}
	return `${gamesLength} active game${gamesLength === 1 ? "" : "s"} in progress`;
}

/** Hide only while you're already inside a game screen. */
function shouldHideActiveGamesBadge(pathname: string) {
	return pathname.startsWith("/game/");
}

export function ActiveGamesBadge({ className = "" }: { className?: string }) {
	const pathname = usePathname();
	const guestId = getGuestId();
	const games = useQuery(api.games.queries.listMyActiveGames, { guestId });

	if (shouldHideActiveGamesBadge(pathname)) return null;

	const badgeGames = games ? gamesForBadge(games) : [];
	if (!badgeGames.length) return null;

	const yourTurn = badgeGames.filter((g) => g.isYourTurn).length;
	const count = yourTurn > 0 ? yourTurn : badgeGames.length;
	const label = activeGamesBadgeLabel(badgeGames.length, yourTurn);

	return (
		<span
			role="status"
			aria-label={label}
			className={`pointer-events-none absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-white ring-2 ring-surface ${className}`}
			title={label}
		>
			{count > 9 ? "9+" : count}
		</span>
	);
}
