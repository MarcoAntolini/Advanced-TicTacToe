"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useCallback, useMemo, useState } from "react";
import { applyMove, serializeGameState, type GameState } from "@/lib/game";
import { getGuestId } from "@/lib/guest";
import { GameHeader } from "./GameHeader";
import { UltimateBoard } from "./UltimateBoard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function GameView({
	gameId,
	localState,
	localMode,
	onLocalMove,
	onLocalRestart,
}: {
	gameId?: Id<"games">;
	localState?: GameState;
	localMode?: boolean;
	onLocalMove?: (board: number, cell: number) => void;
	onLocalRestart?: () => void;
}) {
	const router = useRouter();
	const guestId = getGuestId();
	const game = useQuery(api.games.queries.get, gameId ? { gameId } : "skip");
	const playMove = useMutation(api.games.mutations.playMove).withOptimisticUpdate(
		(localStore, args) => {
			if (!gameId) return;
			const current = localStore.getQuery(api.games.queries.get, { gameId });
			if (!current || current.status !== "active") return;
			try {
				const next = applyMove(
					{
						...current.state,
						boards: current.state.boards.map((b) => [...b]),
						meta: [...current.state.meta],
						moves: [...current.state.moves],
					},
					args.board,
					args.cell,
				);
				localStore.setQuery(api.games.queries.get, { gameId }, {
					...current,
					state: serializeGameState(next),
				});
			} catch {
				// illegal move — leave server state
			}
		},
	);
	const forfeit = useMutation(api.games.mutations.forfeit);
	const rematch = useMutation(api.games.mutations.rematch);
	const join = useMutation(api.games.mutations.join);
	const [error, setError] = useState<string | null>(null);
	const [joinCode, setJoinCode] = useState("");
	const [loading, setLoading] = useState(false);

	const state: GameState | undefined = useMemo(() => {
		if (localMode) return localState;
		if (!game) return undefined;
		return {
			...game.state,
			boards: game.state.boards.map((b) => [...b]),
			meta: [...game.state.meta],
			moves: [...game.state.moves],
		};
	}, [localMode, localState, game]);

	const mode = localMode ? "local" : game?.mode ?? "online";

	const handleMove = useCallback(
		async (board: number, cell: number) => {
			if (!state || state.status !== "active") return;
			setError(null);

			if (localMode && onLocalMove) {
				onLocalMove(board, cell);
				return;
			}

			if (!gameId) return;
			setLoading(true);
			try {
				await playMove({ gameId, board, cell, guestId });
			} catch (e) {
				setError(e instanceof Error ? e.message : "Move failed");
			} finally {
				setLoading(false);
			}
		},
		[state, localMode, onLocalMove, gameId, playMove, guestId],
	);

	const handleJoin = async () => {
		if (!gameId) return;
		setLoading(true);
		try {
			await join({ gameId, inviteCode: joinCode || undefined, guestId });
		} catch (e) {
			setError(e instanceof Error ? e.message : "Join failed");
		} finally {
			setLoading(false);
		}
	};

	if (!localMode && game === undefined) {
		return <p className="text-muted">Loading game…</p>;
	}

	if (!state) {
		return <p className="text-muted">Game not found.</p>;
	}

	const waiting = game?.status === "waiting";

	return (
		<div>
			<GameHeader
				state={state}
				mode={mode}
				onRestart={localMode ? onLocalRestart : undefined}
				onForfeit={
					!localMode && game?.status === "active"
						? async () => {
								if (!gameId) return;
								await forfeit({ gameId, guestId });
							}
						: undefined
				}
				onRematch={
					!localMode && game?.status === "finished"
						? async () => {
								if (!gameId) return;
								const result = await rematch({ gameId, guestId });
								router.push(`/game/${result.gameId}`);
							}
						: undefined
				}
			/>

			{error ? (
				<p className="mb-4 rounded-md bg-danger/20 px-3 py-2 text-sm text-danger" role="alert">
					{error}
				</p>
			) : null}

			{waiting ? (
				<Card className="mb-6 max-w-md">
					<h2 className="mb-2 text-lg font-medium">Waiting for opponent</h2>
					{game?.inviteCode ? (
						<p className="mb-4 text-muted">
							Share code: <strong className="text-foreground">{game.inviteCode}</strong>
						</p>
					) : null}
					<div className="flex flex-col gap-2 sm:flex-row">
						<input
							type="text"
							placeholder="Invite code to join"
							value={joinCode}
							onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
							className="min-h-11 flex-1 rounded-md border border-border bg-bg px-3 text-foreground"
							aria-label="Invite code"
						/>
						<Button onClick={handleJoin} loading={loading}>
							Join game
						</Button>
					</div>
				</Card>
			) : null}

			<UltimateBoard
				state={state}
				onMove={handleMove}
				interactive={!waiting && state.status === "active" && !loading}
			/>
		</div>
	);
}
