"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "@/public/logo.png";
import { primaryNav } from "@/lib/navigation";
import { NavLink } from "./NavLink";
import { UserMenu } from "./UserMenu";
import { MobileNav } from "./MobileNav";
import { ActiveGamesBadge } from "./ActiveGamesBadge";
import { MatchmakingQueueIndicator } from "./MatchmakingQueueIndicator";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Button } from "@/components/ui/Button";

export function Header() {
	const pathname = usePathname();
	const onHome = pathname === "/";

	return (
		<header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
			<div className="flex h-14 w-full items-center gap-3 px-4 sm:gap-6 sm:px-6 lg:px-8">
				<Link
					href="/"
					aria-label="Ultimate TTT — home"
					aria-current={onHome ? "page" : undefined}
					className="flex shrink-0 items-center gap-2.5 rounded-md font-semibold tracking-tight text-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent"
				>
					<Image
						src={logo}
						alt=""
						width={32}
						height={32}
						className="h-8 w-8 shrink-0 object-cover"
						priority
					/>
					<span className="hidden text-[15px] sm:inline">Ultimate TTT</span>
				</Link>

				<nav
					className="hidden items-center gap-0.5 sm:flex"
					aria-label="Main"
				>
					{primaryNav.map((item) => (
						<span key={item.href} className="relative inline-flex">
							<NavLink item={item} />
							{item.href === "/play" ? <ActiveGamesBadge /> : null}
						</span>
					))}
				</nav>

				<div className="ml-auto flex min-w-0 items-center gap-2">
					<MatchmakingQueueIndicator />
					{onHome ? (
						<Link href="/play" className="sm:hidden">
							<Button className="h-9 min-h-9 px-3.5 text-sm">Play</Button>
						</Link>
					) : null}
					<div className="hidden sm:block">
						<ThemeSwitcher />
					</div>
					<div className="hidden md:block">
						<UserMenu />
					</div>
					<MobileNav />
				</div>
			</div>
		</header>
	);
}
