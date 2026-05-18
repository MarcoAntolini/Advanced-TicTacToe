"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import type { Id } from "@convex/_generated/dataModel";

const GameView = dynamic(
	() => import("@/components/game/GameView").then((m) => m.GameView),
	{ ssr: false, loading: () => <p className="text-muted">Loading board…</p> },
);

export default function GamePage() {
	const params = useParams();
	const gameId = params.gameId as Id<"games">;

	return <GameView gameId={gameId} />;
}
