"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { primaryNav } from "@/lib/navigation";
import { NavLink } from "./NavLink";
import { UserMenu } from "./UserMenu";
import { ActiveGamesBadge } from "./ActiveGamesBadge";
import { MatchmakingQueueIndicator } from "./MatchmakingQueueIndicator";
import { RankedMatchmakingQueueIndicator } from "./RankedMatchmakingQueueIndicator";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useScrollLock } from "@/hooks/useScrollLock";

function MobileNavDrawer({ onClose }: { onClose: () => void }) {
	return (
		<div className="fixed inset-0 z-[100]">
			<button
				type="button"
				className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
				aria-label="Close menu"
				onClick={onClose}
			/>
			<div
				role="dialog"
				aria-modal="true"
				aria-label="Menu"
				className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-l border-border bg-surface p-4 shadow-2xl"
			>
				<div className="mb-4 flex shrink-0 items-center justify-between">
					<span className="font-semibold">Menu</span>
					<button
						type="button"
						onClick={onClose}
						className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md hover:bg-surface-elevated focus-visible:ring-2 focus-visible:ring-accent"
						aria-label="Close menu"
					>
						<X className="h-5 w-5" aria-hidden />
					</button>
				</div>
				<MatchmakingQueueIndicator variant="drawer" />
				<RankedMatchmakingQueueIndicator variant="drawer" />
				<nav className="flex flex-col gap-1 overflow-y-auto" aria-label="Main">
					{primaryNav.map((item) => (
						<span key={item.href} className="relative flex w-full">
							<NavLink
								item={item}
								variant="drawer"
								onNavigate={onClose}
							/>
							{item.href === "/play" ? (
								<ActiveGamesBadge className="right-3 top-2.5" />
							) : null}
						</span>
					))}
				</nav>
				<div className="mt-auto shrink-0 space-y-3 border-t border-border pt-4">
					<ThemeSwitcher variant="drawer" onSelect={onClose} />
					<UserMenu variant="drawer" onNavigate={onClose} />
				</div>
			</div>
		</div>
	);
}

export function MobileNav() {
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	useScrollLock(open);

	useEffect(() => {
		setMounted(true);
	}, []);

	const close = () => setOpen(false);

	return (
		<div className="sm:hidden">
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
				aria-label="Open menu"
				aria-expanded={open}
				aria-haspopup="dialog"
			>
				<Menu className="h-5 w-5" aria-hidden />
			</button>

			{open && mounted
				? createPortal(<MobileNavDrawer onClose={close} />, document.body)
				: null}
		</div>
	);
}
