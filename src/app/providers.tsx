"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import dynamic from "next/dynamic";
import { ReactNode } from "react";
import { ClerkUserSync } from "@/components/auth/ClerkUserSync";
import { MatchmakingProvider } from "@/components/layout/MatchmakingContext";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";

const MatchmakingQueueListener = dynamic(
	() =>
		import("@/components/layout/MatchmakingQueueListener").then(
			(m) => m.MatchmakingQueueListener,
		),
	{ ssr: false },
);

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
			<WebVitalsReporter />
			<ConvexWithOptionalClerk>
				<MatchmakingProvider>
					<MatchmakingQueueListener />
					{children}
				</MatchmakingProvider>
			</ConvexWithOptionalClerk>
		</ThemeProvider>
	);

	if (hasClerk) {
		return <ClerkProvider publishableKey={clerkKey}>{inner}</ClerkProvider>;
	}

	return inner;
}
