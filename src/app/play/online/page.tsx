"use client";

import { useMutation } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { api } from "@convex/_generated/api";
import { getGuestId } from "@/lib/guest";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function OnlinePlayContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const mode = (searchParams.get("mode") === "async" ? "async" : "realtime") as
		| "realtime"
		| "async";

	const create = useMutation(api.games.mutations.create);
	const enqueue = useMutation(api.matchmaking.mutations.enqueue);
	const cancelQueue = useMutation(api.matchmaking.mutations.cancel);
	const join = useMutation(api.games.mutations.join);

	const [inviteCode, setInviteCode] = useState("");
	const [joinGameId, setJoinGameId] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [queued, setQueued] = useState(false);

	const guestId = getGuestId();

	const handleCreate = async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await create({ mode, guestId });
			router.push(`/game/${result.gameId}`);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to create game");
		} finally {
			setLoading(false);
		}
	};

	const handleQuickMatch = async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await enqueue({ guestId });
			if (result.matched && result.gameId) {
				router.push(`/game/${result.gameId}`);
			} else {
				setQueued(true);
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : "Matchmaking failed");
		} finally {
			setLoading(false);
		}
	};

	const handleCancelQueue = async () => {
		await cancelQueue({ guestId });
		setQueued(false);
	};

	const handleJoin = async () => {
		if (!joinGameId.trim()) return;
		setLoading(true);
		setError(null);
		try {
			await join({
				gameId: joinGameId.trim() as Parameters<typeof join>[0]["gameId"],
				inviteCode: inviteCode || undefined,
				guestId,
			});
			router.push(`/game/${joinGameId.trim()}`);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to join");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="mx-auto max-w-lg space-y-6">
			<h1 className="text-3xl font-bold capitalize">{mode} play</h1>

			{error ? (
				<p className="rounded-md bg-danger/20 px-3 py-2 text-sm text-danger" role="alert">
					{error}
				</p>
			) : null}

			<Card>
				<h2 className="mb-4 text-lg font-medium">Create a room</h2>
				<Button onClick={handleCreate} loading={loading} className="w-full">
					Create game
				</Button>
			</Card>

			{mode === "realtime" ? (
				<Card>
					<h2 className="mb-4 text-lg font-medium">Quick match</h2>
					{queued ? (
						<div className="space-y-3">
							<p className="text-muted">Searching for opponent…</p>
							<Button variant="secondary" onClick={handleCancelQueue} className="w-full">
								Cancel
							</Button>
						</div>
					) : (
						<Button onClick={handleQuickMatch} loading={loading} className="w-full">
							Find opponent
						</Button>
					)}
				</Card>
			) : null}

			<Card>
				<h2 className="mb-4 text-lg font-medium">Join with code</h2>
				<div className="space-y-3">
					<input
						type="text"
						placeholder="Game ID"
						value={joinGameId}
						onChange={(e) => setJoinGameId(e.target.value)}
						className="min-h-11 w-full rounded-md border border-border bg-bg px-3"
						aria-label="Game ID"
					/>
					<input
						type="text"
						placeholder="Invite code (optional)"
						value={inviteCode}
						onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
						className="min-h-11 w-full rounded-md border border-border bg-bg px-3"
						aria-label="Invite code"
					/>
					<Button variant="secondary" onClick={handleJoin} loading={loading} className="w-full">
						Join game
					</Button>
				</div>
			</Card>
		</div>
	);
}

export default function OnlinePlayPage() {
	return (
		<Suspense fallback={<p className="text-muted">Loading…</p>}>
			<OnlinePlayContent />
		</Suspense>
	);
}
