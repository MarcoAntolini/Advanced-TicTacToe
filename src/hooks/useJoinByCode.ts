"use client";

import { useJoinGame } from "@/hooks/useJoinGame";

/** @deprecated Use useJoinGame */
export function useJoinByCode() {
	const join = useJoinGame();

	return {
		loading: join.loading,
		error: join.error,
		pendingConfirm: join.pendingConfirm,
		setPendingConfirm: join.setPendingConfirm,
		runJoin: (inviteCode: string, forceLeaveActive = false) =>
			join.runJoin({ type: "invite", inviteCode }, forceLeaveActive),
	};
}
