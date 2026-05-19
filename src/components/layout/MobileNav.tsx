"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { primaryNav } from "@/lib/navigation";
import { NavLink } from "./NavLink";
import { UserMenu } from "./UserMenu";
import { ActiveGamesBadge } from "./ActiveGamesBadge";
import { MatchmakingQueueIndicator } from "./MatchmakingQueueIndicator";
import { RankedMatchmakingQueueIndicator } from "./RankedMatchmakingQueueIndicator";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function MobileNav() {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		document.body.style.overflow = open ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	return (
		<div className="sm:hidden">
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
				aria-label="Open menu"
				aria-expanded={open}
			>
				<Menu className="h-5 w-5" aria-hidden />
			</button>

			{open ? (
				<div className="fixed inset-0 z-50">
					<button
						type="button"
						className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
						aria-label="Close menu"
						onClick={() => setOpen(false)}
					/>
					<div className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-l border-border bg-surface p-4 shadow-2xl">
						<div className="mb-4 flex items-center justify-between">
							<span className="font-semibold">Menu</span>
							<button
								type="button"
								onClick={() => setOpen(false)}
								className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md hover:bg-surface-elevated focus-visible:ring-2 focus-visible:ring-accent"
								aria-label="Close menu"
							>
								<X className="h-5 w-5" aria-hidden />
							</button>
						</div>
						<MatchmakingQueueIndicator variant="drawer" />
						<RankedMatchmakingQueueIndicator variant="drawer" />
						<nav className="flex flex-col gap-1" aria-label="Main">
							{primaryNav.map((item) => (
								<span key={item.href} className="relative inline-flex">
									<NavLink
										item={item}
										variant="drawer"
										onNavigate={() => setOpen(false)}
									/>
									{item.href === "/play" ? (
										<ActiveGamesBadge className="right-3 top-2.5" />
									) : null}
								</span>
							))}
						</nav>
						<div className="mt-auto space-y-3 border-t border-border pt-4">
							<ThemeSwitcher
								variant="drawer"
								onSelect={() => setOpen(false)}
							/>
							<UserMenu onNavigate={() => setOpen(false)} />
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}
