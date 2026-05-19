"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Copy, Check, Link2, X } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { getGuestId } from "@/lib/guest";
import { buildJoinUrl, copyToClipboard } from "@/lib/invite";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function WaitingRoomPanel({
	gameId,
	inviteCode,
	mode,
}: {
	gameId: Id<"games">;
	inviteCode: string;
	mode: string;
}) {
	const router = useRouter();
	const guestId = getGuestId();
	const cancelRoom = useMutation(api.games.mutations.cancelRoom);

	const [copiedLink, setCopiedLink] = useState(false);
	const [copiedCode, setCopiedCode] = useState(false);
	const [cancelling, setCancelling] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const joinUrl = buildJoinUrl(inviteCode);

	const handleCopyLink = async () => {
		const ok = await copyToClipboard(joinUrl);
		setCopiedLink(ok);
		if (ok) setTimeout(() => setCopiedLink(false), 2000);
	};

	const handleCopyCode = async () => {
		const ok = await copyToClipboard(inviteCode);
		setCopiedCode(ok);
		if (ok) setTimeout(() => setCopiedCode(false), 2000);
	};

	const handleCancel = async () => {
		setCancelling(true);
		setError(null);
		try {
			await cancelRoom({ gameId, guestId });
			router.push(`/play/online?mode=${mode}`);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Could not cancel room");
		} finally {
			setCancelling(false);
		}
	};

	return (
		<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-4">
			<Card className="pointer-events-auto w-full max-w-md animate-overlay-panel border-border/80 bg-surface/95 shadow-2xl backdrop-blur-sm">
				<div className="flex flex-col items-center text-center">
					<p className="text-sm font-medium uppercase tracking-wide text-accent">
						Waiting for opponent
					</p>
					<h2 className="mt-2 text-xl font-semibold text-foreground">
						Share this room with a friend
					</h2>
					<p className="mt-2 text-sm text-muted">
						Send the link or room code. They&apos;ll join as O and the game starts
						automatically.
					</p>

					{error ? (
						<p className="mt-4 w-full rounded-md bg-danger/20 px-3 py-2 text-sm text-danger" role="alert">
							{error}
						</p>
					) : null}

					<div className="mt-6 flex w-full flex-col gap-3">
						<Button onClick={handleCopyLink} className="w-full gap-2">
							{copiedLink ? (
								<Check className="h-4 w-4" aria-hidden />
							) : (
								<Link2 className="h-4 w-4" aria-hidden />
							)}
							{copiedLink ? "Link copied!" : "Copy invite link"}
						</Button>

						<div className="flex items-center gap-2">
							<div className="flex min-h-11 flex-1 items-center justify-center rounded-md border border-border bg-bg px-4 font-mono text-lg font-bold tracking-widest text-foreground">
								{inviteCode}
							</div>
							<Button
								variant="secondary"
								onClick={handleCopyCode}
								className="min-w-[7rem] gap-2"
								aria-label="Copy room code"
							>
								{copiedCode ? (
									<Check className="h-4 w-4" aria-hidden />
								) : (
									<Copy className="h-4 w-4" aria-hidden />
								)}
								{copiedCode ? "Copied" : "Copy"}
							</Button>
						</div>

						<Button
							variant="ghost"
							onClick={handleCancel}
							loading={cancelling}
							className="mt-2 w-full gap-2 text-muted hover:text-danger"
						>
							<X className="h-4 w-4" aria-hidden />
							Cancel room
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
}
