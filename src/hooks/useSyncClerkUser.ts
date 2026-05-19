"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "@convex/_generated/api";
import { clerkDisplayName, hasClerk } from "@/lib/clerk";
import { getGuestId } from "@/lib/guest";

/** Ensures Convex user row exists and merges guest games once per session. */
export function useSyncClerkUser() {
	const { user } = useUser();
	const ensureUser = useMutation(api.users.mutations.ensureUser);
	const mergeGuest = useMutation(api.users.mutations.mergeGuestGames);
	const guestMerged = useRef(false);

	useEffect(() => {
		if (!hasClerk || !user) return;

		const displayName = clerkDisplayName(user);
		void ensureUser({
			displayName,
			avatarUrl: user.imageUrl ?? undefined,
		}).then(() => {
			if (guestMerged.current) return;
			guestMerged.current = true;
			void mergeGuest({ guestId: getGuestId() });
		});
	}, [
		user,
		user?.fullName,
		user?.username,
		user?.imageUrl,
		user?.primaryEmailAddress?.emailAddress,
		ensureUser,
		mergeGuest,
	]);
}
