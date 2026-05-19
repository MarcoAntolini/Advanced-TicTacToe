"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { hasClerk } from "@/lib/clerk";

export function UserMenu({
	onNavigate,
	variant = "header",
}: {
	onNavigate?: () => void;
	variant?: "header" | "drawer";
}) {
	const drawer = variant === "drawer";

	if (!hasClerk) {
		return (
			<span
				className={`rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-xs text-muted ${
					drawer ? "w-full text-center" : ""
				}`}
			>
				Guest
			</span>
		);
	}

	return (
		<div className={drawer ? "w-full" : undefined}>
			<SignedOut>
				<SignInButton mode="modal">
					<Button
						variant="secondary"
						className={`h-10 min-h-10 px-4 text-sm ${drawer ? "w-full justify-center" : ""}`}
					>
						Sign in
					</Button>
				</SignInButton>
			</SignedOut>
			<SignedIn>
				<div
					className={
						drawer
							? "flex w-full flex-col gap-2"
							: "flex items-center gap-2"
					}
				>
					<Link
						href="/activity"
						onClick={() => onNavigate?.()}
						className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-accent/50 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
							drawer ? "w-full justify-center" : ""
						}`}
					>
						<BarChart3 className="h-4 w-4 text-muted" aria-hidden />
						<span className={drawer ? undefined : "hidden sm:inline"}>Activity</span>
					</Link>
					<div className={drawer ? "flex justify-center" : undefined}>
						<UserButton afterSignOutUrl="/" />
					</div>
				</div>
			</SignedIn>
		</div>
	);
}
