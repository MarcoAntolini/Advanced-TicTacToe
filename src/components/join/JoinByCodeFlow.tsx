"use client";

import { useEffect, useRef, useState } from "react";
import { PlayBreadcrumb } from "@/components/layout/PlayBreadcrumb";
import { normalizeInviteCode } from "@/lib/invite";
import { contentWidth } from "@/lib/layout";
import { useJoinByCode } from "@/hooks/useJoinByCode";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function JoinByCodeFlow({
	initialCode = "",
	autoJoin = false,
}: {
	initialCode?: string;
	autoJoin?: boolean;
}) {
	const { loading, error, pendingConfirm, runJoin, setPendingConfirm } = useJoinByCode();
	const [code, setCode] = useState(normalizeInviteCode(initialCode));
	const autoJoinAttempted = useRef(false);

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
							onClick={() => setPendingConfirm(null)}
							className="flex-1"
						>
							Cancel
						</Button>
					</div>
				</Card>
			) : (
				<Card>
					<Label htmlFor="join-room-code" className="block">
						Room code
					</Label>
					<Input
						id="join-room-code"
						type="text"
						value={code}
						onChange={(e) => setCode(normalizeInviteCode(e.target.value))}
						placeholder="e.g. JWU5ME"
						maxLength={8}
						className="mt-1 font-mono text-lg uppercase tracking-widest"
						aria-label="Room code"
						disabled={autoJoin && loading}
					/>
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
