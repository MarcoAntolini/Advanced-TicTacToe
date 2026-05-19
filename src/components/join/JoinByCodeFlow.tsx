"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { PlayBreadcrumb } from "@/components/layout/PlayBreadcrumb";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { getGuestId } from "@/lib/guest";
import { normalizeInviteCode } from "@/lib/invite";
import { contentWidth } from "@/lib/layout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type JoinResult =
	| { result: "joined"; gameId: Id<"games"> }
	| { result: "rejoin"; gameId: Id<"games"> }
	| { result: "needs_confirm"; conflictGameId: Id<"games"> };

export function JoinByCodeFlow({
	initialCode = "",
	autoJoin = false,
}: {
	initialCode?: string;
	autoJoin?: boolean;
}) {
	const router = useRouter();
	const guestId = getGuestId();
	const joinByInviteCode = useMutation(api.games.mutations.joinByInviteCode);

	const [code, setCode] = useState(normalizeInviteCode(initialCode));
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pendingConfirm, setPendingConfirm] = useState<Id<"games"> | null>(null);
	const autoJoinAttempted = useRef(false);

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

	useEffect(() => {
		if (
			autoJoin &&
			initialCode.length >= 4 &&
			!pendingConfirm &&
			!autoJoinAttempted.current
		) {
			autoJoinAttempted.current = true;
			void runJoin(initialCode);
		}
	}, [autoJoin, initialCode, pendingConfirm, runJoin]);

	return (
		<div className={`${contentWidth.narrow} space-y-6`}>
			<PlayBreadcrumb label="Join with code" />

			<div>
				<h1 className="text-3xl font-bold">Join a game</h1>
				<p className="mt-2 text-muted">
					Enter the room code your friend shared, or open their invite link directly.
				</p>
			</div>

			{error ? (
				<p className="rounded-md bg-danger/20 px-3 py-2 text-sm text-danger" role="alert">
					{error}
				</p>
			) : null}

			{pendingConfirm ? (
				<Card className="border-playerO/40 bg-playerO/5">
					<h2 className="text-lg font-semibold">Leave current game?</h2>
					<p className="mt-2 text-sm text-muted">
						You&apos;re already in another realtime match. Joining this room will end
						that game (your opponent wins).
					</p>
					<div className="mt-4 flex flex-col gap-2 sm:flex-row">
						<Button
							variant="danger"
							loading={loading}
							onClick={() => void runJoin(code, true)}
							className="flex-1"
						>
							Leave & join
						</Button>
						<Button
							variant="secondary"
							onClick={() => {
								setPendingConfirm(null);
								router.push(`/game/${pendingConfirm}`);
							}}
							className="flex-1"
						>
							Stay in current game
						</Button>
					</div>
				</Card>
			) : (
				<Card>
					<label className="block text-sm font-medium text-foreground">
						Room code
						<input
							type="text"
							value={code}
							onChange={(e) => setCode(normalizeInviteCode(e.target.value))}
							placeholder="e.g. JWU5ME"
							maxLength={8}
							className="mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-3 font-mono text-lg tracking-widest text-foreground uppercase"
							aria-label="Room code"
							disabled={autoJoin && loading}
						/>
					</label>
					<Button
						onClick={() => void runJoin(code)}
						loading={loading}
						className="mt-4 w-full"
						disabled={code.length < 4}
					>
						Join game
					</Button>
				</Card>
			)}

		</div>
	);
}
