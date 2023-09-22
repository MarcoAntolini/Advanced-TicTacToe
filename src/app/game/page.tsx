"use client";

import Cell from "@/components/cell";
import { Player } from "@/types/game";
import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";

export default function GamePage() {
	const createGame = useMutation(api.games.mutations.createGame);

	const [currentPlayer, setCurrentPlayer] = useState("X" as Player);
	// const [game, setGame] = useState<Game>({});

	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<button
				onClick={async (e) => {
					e.preventDefault();
					setCurrentPlayer("O");
					await createGame();
				}}
			>
				test
			</button>
			<Cell player={currentPlayer} />
		</main>
	);
}
