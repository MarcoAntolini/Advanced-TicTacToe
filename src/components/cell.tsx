"use client";

import { Player } from "@/types/game";

export default function Cell({ player }: { player: Player }) {
	return (
		<>
			<td className="border border-black w-16 h-16"></td>
		</>
	);
}
