"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeInviteCode } from "@/lib/invite";
import { useJoinByCode } from "@/hooks/useJoinByCode";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function JoinCodeInline() {
	const router = useRouter();
	const { loading, error, pendingConfirm, runJoin, setPendingConfirm } = useJoinByCode();
	const [code, setCode] = useState("");

	if (pendingConfirm) {
		return (
			<Card className="border-playerO/40 bg-playerO/5">
				<h3 className="font-semibold">Leave current game?</h3>
				<p className="mt-2 text-sm text-muted">
					You&apos;re already in another realtime match. Joining will end that game (your
					opponent wins).
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
		);
	}

	return (
		<Card className="border-dashed">
			<Label htmlFor="play-join-room-code" className="block">
				Room code
			</Label>
			<Input
				id="play-join-room-code"
				type="text"
				value={code}
				onChange={(e) => setCode(normalizeInviteCode(e.target.value))}
				placeholder="e.g. JWU5ME"
				maxLength={8}
				className="mt-1 font-mono text-lg uppercase tracking-widest"
				aria-label="Room code"
			/>
			{error ? (
				<p className="mt-2 text-sm text-danger" role="alert">
					{error}
				</p>
			) : null}
			<Button
				onClick={() => void runJoin(code)}
				loading={loading}
				className="mt-4 w-full"
				disabled={code.length < 4}
			>
				Join game
			</Button>
		</Card>
	);
}
