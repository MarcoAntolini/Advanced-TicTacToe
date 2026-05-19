"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { primaryNav } from "@/lib/navigation";
import { NavLink } from "./NavLink";
import { UserMenu } from "./UserMenu";
import { ActiveGamesBadge } from "./ActiveGamesBadge";
import { MatchmakingQueueIndicator } from "./MatchmakingQueueIndicator";
import { RankedMatchmakingQueueIndicator } from "./RankedMatchmakingQueueIndicator";
import { ThemeSwitcher } from "./ThemeSwitcher";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

function MobileNavDrawer({ onClose }: { onClose: () => void }) {
	return (
		<>
			<SheetHeader className="mb-4 shrink-0 space-y-0 text-left">
				<SheetTitle>Menu</SheetTitle>
			</SheetHeader>
			<MatchmakingQueueIndicator variant="drawer" />
			<RankedMatchmakingQueueIndicator variant="drawer" />
			<nav className="flex flex-col gap-1 overflow-y-auto" aria-label="Main">
				{primaryNav.map((item) => (
					<span key={item.href} className="relative flex w-full">
						<NavLink item={item} variant="drawer" onNavigate={onClose} />
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
		</>
	);
}

export function MobileNav() {
	const [open, setOpen] = useState(false);

	return (
		<div className="sm:hidden">
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetTrigger asChild>
					<button
						type="button"
						className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
						aria-label="Open menu"
						aria-expanded={open}
					>
						<Menu className="h-5 w-5" aria-hidden />
					</button>
				</SheetTrigger>
				<SheetContent side="right" className="flex w-[min(100%,20rem)] flex-col p-4">
					<MobileNavDrawer onClose={() => setOpen(false)} />
				</SheetContent>
			</Sheet>
		</div>
	);
}
