"use client";

import { Loader2 } from "lucide-react";
import { useRankedMatchmakingQueue } from "@/hooks/useRankedMatchmakingQueue";
import { Button } from "@/components/ui/Button";

export function RankedMatchmakingQueueIndicator({
	variant = "header",
}: {
	variant?: "header" | "drawer";
}) {
	const { inQueue, cancelSearch, cancelling, isLoading } = useRankedMatchmakingQueue();

	if (isLoading || !inQueue) return null;

	if (variant === "drawer") {
		return (
			<div
				className="mb-3 rounded-xl bg-surface-elevated p-3.5"
				role="status"
				aria-live="polite"
			>
				<div className="flex items-start gap-3">
					<Loader2
						className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-accent"
						aria-hidden
					/>
					<div className="min-w-0 flex-1">
						<p className="text-sm font-medium text-foreground">Finding ranked opponent…</p>
						<p className="mt-1 text-xs leading-relaxed text-muted">
							Rated matchmaking stays active while you browse. Cancel anytime.
						</p>
					</div>
					<Button
						type="button"
						variant="ghost"
						onClick={() => void cancelSearch()}
						loading={cancelling}
						className="h-8 min-h-8 shrink-0 rounded-full bg-bg/50 px-3 text-sm text-muted transition-colors hover:bg-danger/20 hover:text-danger"
					>
						Cancel
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div
			className="inline-flex max-w-[min(100%,15rem)] items-center gap-2.5 rounded-full bg-surface-elevated px-2.5 py-1 sm:max-w-none sm:gap-3 sm:px-3 sm:py-1.5"
			role="status"
			aria-live="polite"
		>
			<div className="flex min-w-0 items-center gap-2">
				<Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-accent" aria-hidden />
				<span className="truncate text-xs font-medium text-foreground sm:text-sm">
					<span className="sm:hidden">Ranked…</span>
					<span className="hidden sm:inline">Finding ranked…</span>
				</span>
			</div>
			<Button
				type="button"
				variant="ghost"
				onClick={() => void cancelSearch()}
				loading={cancelling}
				className="h-7 min-h-7 min-w-0 shrink-0 rounded-full bg-bg/50 px-2.5 text-xs font-medium text-muted transition-colors hover:bg-danger/20 hover:text-danger sm:h-8 sm:min-h-8 sm:px-3 sm:text-sm"
			>
				Cancel
			</Button>
		</div>
	);
}
