"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { hasClerk } from "@/lib/clerk";

export function UserMenu({ onNavigate }: { onNavigate?: () => void }) {
	if (!hasClerk) {
		return (
			<span className="rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-xs text-muted">
				Guest
			</span>
		);
	}

	return (
		<>
			<SignedOut>
				<SignInButton mode="modal">
					<Button variant="secondary" className="h-10 min-h-10 px-4 text-sm">
						Sign in
					</Button>
				</SignInButton>
			</SignedOut>
			<SignedIn>
				<div className="flex items-center gap-2">
					<Link
						href="/activity"
						onClick={() => onNavigate?.()}
						className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-accent/50 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
					>
						<BarChart3 className="h-4 w-4 text-muted" aria-hidden />
						<span className="hidden sm:inline">Activity</span>
					</Link>
					<UserButton afterSignOutUrl="/" />
				</div>
			</SignedIn>
		</>
	);
}
