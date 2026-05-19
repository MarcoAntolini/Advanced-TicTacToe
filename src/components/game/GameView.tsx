"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useCallback, useMemo, useState } from "react";
import { applyMove, serializeGameState, type GameState } from "@/lib/game";
import { getGuestId } from "@/lib/guest";
import { GameHeader } from "./GameHeader";
import { GameOverOverlay } from "./GameOverOverlay";
import { RankedClockBar } from "./RankedClockBar";
import { WaitingRoomPanel } from "./WaitingRoomPanel";
import { UltimateBoard } from "./UltimateBoard";

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
	const profile = useQuery(api.users.queries.getProfile);
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
	const [error, setError] = useState<string | null>(null);
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

	/** Align board UI with document status when older games only patched `game.status`. */
	const displayState: GameState | undefined = useMemo(() => {
		if (!state) return undefined;
		if (localMode || !game || game.status !== "finished" || state.status !== "active") {
			return state;
		}
		if (game.winner === "draw") {
			return { ...state, status: "draw", winner: null };
		}
		if (game.winner === "X" || game.winner === "O") {
			return { ...state, status: "won", winner: game.winner };
		}
		return state;
	}, [state, game, localMode]);

	const canPlay =
		!!displayState &&
		displayState.status === "active" &&
		(localMode || game?.status === "active");

	const mode = localMode ? "local" : game?.isRanked ? "ranked" : (game?.mode ?? "online");
	const ratingResult = useQuery(
		api.ratings.queries.getForGame,
		gameId && game?.isRanked && game.status === "finished" ? { gameId } : "skip",
	);
	const waiting = !localMode && game?.status === "waiting";

	const handleMove = useCallback(
		async (board: number, cell: number) => {
			if (!canPlay) return;
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
		[canPlay, localMode, onLocalMove, gameId, playMove, guestId],
	);

	if (!localMode && game === undefined) {
		return <p className="text-muted">Loading game…</p>;
	}

	if (!displayState) {
		return <p className="text-muted">Game not found.</p>;
	}

	return (
		<div>
			<GameHeader
				state={displayState}
				mode={mode}
				gameStatus={localMode ? undefined : game?.status}
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

			{!localMode && game?.isRanked && game.status === "active" ? (
				<RankedClockBar game={game} />
			) : null}

			<div className="relative w-full">
				<div className={waiting ? "pointer-events-none w-full opacity-40" : "w-full"}>
					<UltimateBoard
						state={displayState}
						onMove={handleMove}
						interactive={!waiting && canPlay && !loading}
					/>
				</div>

				{waiting && gameId && game?.inviteCode ? (
					<WaitingRoomPanel
						gameId={gameId}
						inviteCode={game.inviteCode}
						mode={game.mode}
					/>
				) : null}

				<GameOverOverlay
					state={displayState}
					ratingDelta={
						game?.isRanked && ratingResult && profile
							? profile._id === ratingResult.playerXId
								? ratingResult.deltaX
								: profile._id === ratingResult.playerOId
									? ratingResult.deltaO
									: undefined
							: undefined
					}
					onRestart={localMode ? onLocalRestart : undefined}
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
			</div>
		</div>
	);
}
