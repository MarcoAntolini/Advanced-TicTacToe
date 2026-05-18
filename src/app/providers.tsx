"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";

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
				{children}
			</ConvexProviderWithClerk>
		);
	}
	return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

export function Providers({ children }: { children: ReactNode }) {
	const inner = <ConvexWithOptionalClerk>{children}</ConvexWithOptionalClerk>;

	if (hasClerk) {
		return <ClerkProvider publishableKey={clerkKey}>{inner}</ClerkProvider>;
	}

	return inner;
}
