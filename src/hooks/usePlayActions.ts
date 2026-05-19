"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { getGuestId } from "@/lib/guest";
import type { AutoFindActionId, CreateGameSettings } from "@/lib/play/types";
import {
	DEFAULT_CREATE_SETTINGS,
	toCreateMutationArgs,
} from "@/lib/play/playFlowConfig";

type MatchResult =
	| { matched: true; gameId: Id<"games"> }
	| { matched: false; inQueue?: true; blocked?: true; gameId?: Id<"games"> };

export function usePlayActions() {
	const router = useRouter();
	const guestId = getGuestId();
	const enqueue = useMutation(api.matchmaking.mutations.enqueue);
	const enqueueRanked = useMutation(api.rankedMatchmaking.mutations.enqueue);
	const createGame = useMutation(api.games.mutations.create);
	const joinPublic = useMutation(api.games.mutations.joinPublicGame);

	const [loadingAction, setLoadingAction] = useState<AutoFindActionId | "create" | null>(
		null,
	);
	const [error, setError] = useState<string | null>(null);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);

	const runAutoFind = useCallback(
		async (actionId: AutoFindActionId) => {
			setLoadingAction(actionId);
			setError(null);
			setStatusMessage(null);
			try {
				if (actionId === "ranked") {
					const result = (await enqueueRanked({})) as MatchResult & {
						blocked?: boolean;
						inQueue?: boolean;
					};
					if ("blocked" in result && result.blocked && result.gameId) {
						setStatusMessage(
							"You're already in a realtime game. Finish or forfeit it before starting another.",
						);
						return;
					}
					if ("inQueue" in result && result.inQueue) {
						setStatusMessage("Already searching — cancel from the header anytime.");
						return;
					}
					if (result.matched && result.gameId) {
						router.push(`/game/${result.gameId}`);
						return;
					}
					setStatusMessage(
						"Searching for a rated opponent. Cancel from the header anytime.",
					);
					return;
				}

				const mode = actionId === "async" ? "async" : "realtime";
				const result = (await enqueue({ guestId, mode })) as MatchResult & {
					blocked?: boolean;
					inQueue?: boolean;
				};

				if ("blocked" in result && result.blocked && result.gameId) {
					setStatusMessage(
						"You're already in a realtime game. Finish or forfeit it before starting another.",
					);
					return;
				}
				if ("inQueue" in result && result.inQueue) {
					setStatusMessage("Already searching — cancel from the header anytime.");
					return;
				}
				if (result.matched && result.gameId) {
					router.push(`/game/${result.gameId}`);
					return;
				}

				setStatusMessage(
					mode === "async"
						? "Searching for an async opponent. Cancel from the header anytime."
						: "Searching for an opponent. Cancel from the header anytime.",
				);
			} catch (e) {
				setError(e instanceof Error ? e.message : "Matchmaking failed");
			} finally {
				setLoadingAction(null);
			}
		},
		[enqueue, enqueueRanked, guestId, router],
	);

	const runCreate = useCallback(
		async (settings: CreateGameSettings = DEFAULT_CREATE_SETTINGS) => {
			setLoadingAction("create");
			setError(null);
			try {
				const result = await createGame({
					guestId,
					...toCreateMutationArgs(settings),
				});
				router.push(`/game/${result.gameId}`);
			} catch (e) {
				const message = e instanceof Error ? e.message : "Failed to create room";
				setError(
					message.includes("active realtime game")
						? "You already have a realtime game in progress. Use Continue playing above to resume it, or create an async room instead."
						: message,
				);
			} finally {
				setLoadingAction(null);
			}
		},
		[createGame, guestId, router],
	);

	const runJoinPublic = useCallback(
		async (gameId: Id<"games">, forceLeaveActive = false) => {
			setError(null);
			try {
				const response = await joinPublic({ gameId, guestId, forceLeaveActive });
				if (response.result === "needs_confirm") {
					return { needsConfirm: true as const, conflictGameId: response.conflictGameId };
				}
				router.push(`/game/${response.gameId}`);
				return { needsConfirm: false as const, failed: false as const };
			} catch (e) {
				setError(e instanceof Error ? e.message : "Could not join game");
				return { needsConfirm: false as const, failed: true as const };
			}
		},
		[joinPublic, guestId, router],
	);

	return {
		loadingAction,
		error,
		statusMessage,
		setError,
		setStatusMessage,
		runAutoFind,
		runCreate,
		runJoinPublic,
	};
}
