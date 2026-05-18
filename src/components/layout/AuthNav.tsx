"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

const hasClerk =
	typeof process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === "string" &&
	process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_") &&
	process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.length > 20 &&
	!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder");

export function AuthNav() {
	if (!hasClerk) {
		return (
			<span className="text-xs text-muted" title="Set Clerk keys in .env.local">
				Guest mode
			</span>
		);
	}

	return (
		<>
			<SignedIn>
				<Link href="/history" className="text-muted hover:text-foreground">
					History
				</Link>
				<Link href="/profile" className="text-muted hover:text-foreground">
					Profile
				</Link>
				<UserButton afterSignOutUrl="/" />
			</SignedIn>
			<SignedOut>
				<SignInButton mode="modal">
					<button
						type="button"
						className="min-h-11 rounded-md px-3 text-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent"
					>
						Sign in
					</button>
				</SignInButton>
			</SignedOut>
		</>
	);
}
