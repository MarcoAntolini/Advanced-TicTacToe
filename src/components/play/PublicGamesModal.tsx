"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { getGuestId } from "@/lib/guest";
import { usePlayActions } from "@/hooks/usePlayActions";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export function PublicGamesModal({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const guestId = getGuestId();
	const games = useQuery(api.games.queries.listPublicWaitingGames, { guestId });
	const { runJoinPublic, error, setError } = usePlayActions();
	const [joiningId, setJoiningId] = useState<Id<"games"> | null>(null);
	const [pendingConfirm, setPendingConfirm] = useState<Id<"games"> | null>(null);

	const handleJoin = async (gameId: Id<"games">, force = false) => {
		setJoiningId(gameId);
		setError(null);
		const result = await runJoinPublic(gameId, force);
		setJoiningId(null);
		if (result.needsConfirm) {
			setPendingConfirm(gameId);
			return;
		}
		if (!result.needsConfirm && !result.failed) {
			onClose();
		}
	};

	return (
		<Modal open={open} onClose={onClose} title="Public games">
			{pendingConfirm ? (
				<Card className="mb-4 border-playerO/40 bg-playerO/5">
					<p className="text-sm text-muted">
						Leave your current realtime game to join this room? Your opponent will win
						the abandoned match.
					</p>
					<div className="mt-4 flex flex-col gap-2 sm:flex-row">
						<Button
							variant="danger"
							loading={joiningId !== null}
							onClick={() => {
								void handleJoin(pendingConfirm, true).then(() =>
									setPendingConfirm(null),
								);
							}}
						>
							Leave & join
						</Button>
						<Button variant="secondary" onClick={() => setPendingConfirm(null)}>
							Cancel
						</Button>
					</div>
				</Card>
			) : null}

			{error ? (
				<p className="mb-3 text-sm text-danger" role="alert">
					{error}
				</p>
			) : null}

			{games === undefined ? (
				<p className="text-sm text-muted">Loading open games…</p>
			) : games.length === 0 ? (
				<p className="text-sm text-muted">
					No public waiting rooms right now. Create one and set visibility to public.
				</p>
			) : (
				<ul className="space-y-2">
					{games.map((game) => (
						<li key={game.gameId}>
							<div className="flex items-center justify-between gap-3 rounded-md border border-border bg-bg px-3 py-2">
								<div className="min-w-0">
									<p className="font-medium capitalize">{game.mode}</p>
									<p className="text-xs text-muted">
										{game.isPractice
											? "Ranked practice"
											: game.isRanked
												? "Ranked rules"
												: "Normal rules"}
									</p>
								</div>
								<div className="flex shrink-0 items-center gap-2">
									{game.isPractice ? <Badge>Practice</Badge> : null}
									<Button
										className="min-h-9 px-3 py-1 text-sm"
										loading={joiningId === game.gameId}
										onClick={() => void handleJoin(game.gameId)}
									>
										Join
									</Button>
								</div>
							</div>
						</li>
					))}
				</ul>
			)}
		</Modal>
	);
}
