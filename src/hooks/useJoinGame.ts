"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { getGuestId } from "@/lib/guest";
import { normalizeInviteCode } from "@/lib/invite";

export type JoinTarget =
	| { type: "invite"; inviteCode: string }
	| { type: "public"; gameId: Id<"games"> };

export type JoinGameResult =
	| { result: "joined" | "rejoin"; gameId: Id<"games"> }
	| { result: "needs_confirm"; conflictGameId: Id<"games"> }
	| { result: "invalid_code" };

export function useJoinGame() {
	const router = useRouter();
	const guestId = getGuestId();
	const joinByInviteCode = useMutation(api.games.mutations.joinByInviteCode);
	const joinPublic = useMutation(api.games.mutations.joinPublicGame);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pendingConfirm, setPendingConfirm] = useState<Id<"games"> | null>(null);

	const runJoin = useCallback(
		async (target: JoinTarget, forceLeaveActive = false): Promise<JoinGameResult | null> => {
			setLoading(true);
			setError(null);
			if (!forceLeaveActive) setPendingConfirm(null);

			try {
				if (target.type === "invite") {
					const normalized = normalizeInviteCode(target.inviteCode);
					if (normalized.length < 4) {
						setError("Enter a valid room code");
						return { result: "invalid_code" };
					}

					const response = await joinByInviteCode({
						inviteCode: normalized,
						guestId,
						forceLeaveActive,
					});

					if (response.result === "needs_confirm") {
						setPendingConfirm(response.conflictGameId);
						return response;
					}

					router.push(`/game/${response.gameId}`);
					return response;
				}

				const response = await joinPublic({
					gameId: target.gameId,
					guestId,
					forceLeaveActive,
				});

				if (response.result === "needs_confirm") {
					setPendingConfirm(response.conflictGameId);
					return response;
				}

				router.push(`/game/${response.gameId}`);
				return response;
			} catch (e) {
				setError(e instanceof Error ? e.message : "Could not join game");
				return null;
			} finally {
				setLoading(false);
			}
		},
		[joinByInviteCode, joinPublic, guestId, router],
	);

	return {
		loading,
		error,
		pendingConfirm,
		setPendingConfirm,
		setError,
		runJoin,
	};
}
