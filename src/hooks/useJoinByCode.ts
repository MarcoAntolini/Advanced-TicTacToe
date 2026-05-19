"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { getGuestId } from "@/lib/guest";
import { normalizeInviteCode } from "@/lib/invite";

type JoinResult =
	| { result: "joined"; gameId: Id<"games"> }
	| { result: "rejoin"; gameId: Id<"games"> }
	| { result: "needs_confirm"; conflictGameId: Id<"games"> };

export function useJoinByCode() {
	const router = useRouter();
	const guestId = getGuestId();
	const joinByInviteCode = useMutation(api.games.mutations.joinByInviteCode);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pendingConfirm, setPendingConfirm] = useState<Id<"games"> | null>(null);

	const runJoin = useCallback(
		async (inviteCode: string, forceLeaveActive = false) => {
			const normalized = normalizeInviteCode(inviteCode);
			if (normalized.length < 4) {
				setError("Enter a valid room code");
				return;
			}

			setLoading(true);
			setError(null);
			setPendingConfirm(null);

			try {
				const response = (await joinByInviteCode({
					inviteCode: normalized,
					guestId,
					forceLeaveActive,
				})) as JoinResult;

				if (response.result === "needs_confirm") {
					setPendingConfirm(response.conflictGameId);
					return;
				}

				router.push(`/game/${response.gameId}`);
			} catch (e) {
				setError(e instanceof Error ? e.message : "Could not join room");
			} finally {
				setLoading(false);
			}
		},
		[joinByInviteCode, guestId, router],
	);

	return {
		loading,
		error,
		pendingConfirm,
		setPendingConfirm,
		runJoin,
	};
}
