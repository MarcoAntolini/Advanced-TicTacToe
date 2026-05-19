"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { applyMove, createInitialState, type GameState } from "@/lib/game";
import { PlayBreadcrumb } from "@/components/layout/PlayBreadcrumb";
import { contentWidth } from "@/lib/layout";

const GameView = dynamic(
	() => import("@/components/game/GameView").then((m) => m.GameView),
	{ ssr: false, loading: () => <p className="text-muted">Loading board…</p> },
);

export default function LocalPlayPage() {
	const [state, setState] = useState<GameState>(() => createInitialState());

	const handleMove = useCallback((board: number, cell: number) => {
		setState((s) => applyMove(s, board, cell));
	}, []);

	const handleRestart = useCallback(() => {
		setState(createInitialState());
	}, []);

	return (
		<div className={`${contentWidth.game} space-y-4`}>
			<PlayBreadcrumb label="Local" />
			<GameView
			localMode
			localState={state}
			onLocalMove={handleMove}
			onLocalRestart={handleRestart}
			/>
		</div>
	);
}
