"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";
import { ClerkUserSync } from "@/components/auth/ClerkUserSync";
import { MatchmakingQueueListener } from "@/components/layout/MatchmakingQueueListener";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const hasClerk =
	clerkKey.startsWith("pk_") &&
	clerkKey.length > 20 &&
	!clerkKey.includes("placeholder");

function ConvexWithOptionalClerk({ children }: { children: ReactNode }) {
	if (hasClerk) {
		return (
			<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
				<ClerkUserSync />
				{children}
			</ConvexProviderWithClerk>
		);
	}
	return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

export function Providers({ children }: { children: ReactNode }) {
	const inner = (
		<ThemeProvider>
			<ConvexWithOptionalClerk>
				<MatchmakingQueueListener />
				{children}
			</ConvexWithOptionalClerk>
		</ThemeProvider>
	);

	if (hasClerk) {
		return <ClerkProvider publishableKey={clerkKey}>{inner}</ClerkProvider>;
	}

	return inner;
}
