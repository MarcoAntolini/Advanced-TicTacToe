"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { primaryNav } from "@/lib/navigation";
import { NavLink } from "./NavLink";
import { Button } from "@/components/ui/Button";

const ActiveGamesBadge = dynamic(
	() => import("./ActiveGamesBadge").then((m) => m.ActiveGamesBadge),
	{ ssr: false },
);

const MatchmakingQueueIndicator = dynamic(
	() => import("./MatchmakingQueueIndicator").then((m) => m.MatchmakingQueueIndicator),
	{ ssr: false },
);

const RankedMatchmakingQueueIndicator = dynamic(
	() =>
		import("./RankedMatchmakingQueueIndicator").then(
			(m) => m.RankedMatchmakingQueueIndicator,
		),
	{ ssr: false },
);

const ThemeSwitcher = dynamic(
	() => import("./ThemeSwitcher").then((m) => m.ThemeSwitcher),
	{ ssr: false },
);

const UserMenu = dynamic(() => import("./UserMenu").then((m) => m.UserMenu), {
	ssr: false,
});

const MobileNav = dynamic(() => import("./MobileNav").then((m) => m.MobileNav), {
	ssr: false,
	loading: () => (
		<div className="sm:hidden">
			<div className="min-h-9 min-w-9" aria-hidden />
		</div>
	),
});

export function HeaderClient() {
	const pathname = usePathname();
	const onHome = pathname === "/";

	return (
		<>
			<nav className="hidden items-center gap-0.5 sm:flex" aria-label="Main">
				{primaryNav.map((item) => (
					<span key={item.href} className="relative inline-flex">
						<NavLink item={item} />
						{item.href === "/play" ? <ActiveGamesBadge /> : null}
					</span>
				))}
			</nav>

			<div className="ml-auto flex min-w-0 items-center gap-2">
				<MatchmakingQueueIndicator />
				<RankedMatchmakingQueueIndicator />
				{onHome ? (
					<Link href="/play" className="sm:hidden">
						<Button className="h-9 min-h-9 px-3.5 text-sm">Play</Button>
					</Link>
				) : null}
				<div className="hidden sm:block">
					<ThemeSwitcher />
				</div>
				<div className="hidden sm:flex sm:items-center">
					<UserMenu />
				</div>
				<MobileNav />
			</div>
		</>
	);
}
