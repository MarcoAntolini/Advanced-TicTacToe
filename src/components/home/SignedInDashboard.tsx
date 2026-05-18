"use client";

import { SignedIn } from "@clerk/nextjs";
import { Trophy } from "lucide-react";
import { HomeDashboard } from "./HomeDashboard";

const hasClerk =
	typeof process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === "string" &&
	process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_") &&
	process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.length > 20 &&
	!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder");

export function SignedInDashboard() {
	if (!hasClerk) return null;

	return (
		<SignedIn>
			<section>
				<div className="mb-4 flex items-center gap-2">
					<Trophy className="h-5 w-5 text-accent" aria-hidden />
					<h2 className="text-xl font-semibold">Your dashboard</h2>
				</div>
				<HomeDashboard />
			</section>
		</SignedIn>
	);
}
