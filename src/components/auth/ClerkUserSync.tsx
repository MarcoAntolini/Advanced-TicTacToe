"use client";

import { useSyncClerkUser } from "@/hooks/useSyncClerkUser";

export function ClerkUserSync() {
	useSyncClerkUser();
	return null;
}
