export const hasClerk =
	typeof process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === "string" &&
	process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_") &&
	process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.length > 20 &&
	!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder");

type ClerkProfile = {
	fullName: string | null;
	username: string | null;
	primaryEmailAddress?: { emailAddress: string } | null;
};

export function clerkDisplayName(user: ClerkProfile): string {
	return (
		user.fullName ??
		user.username ??
		user.primaryEmailAddress?.emailAddress ??
		"Player"
	);
}
