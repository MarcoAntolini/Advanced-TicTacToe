/** Decorative 3×3 meta-board used on the rules page (not interactive). */
import { PlayerMark } from "@/components/game/PlayerMark";

export function MetaBoardDiagram({
	className = "",
	showCaption = true,
}: {
	className?: string;
	showCaption?: boolean;
}) {
	const cells: Array<"empty" | "x" | "o" | "closed" | "active"> = [
		"x",
		"empty",
		"o",
		"empty",
		"active",
		"empty",
		"o",
		"closed",
		"x",
	];

	return (
		<div
			className={`mx-auto w-full max-w-[220px] rounded-xl border border-border bg-surface-elevated p-2.5 shadow-inner ${className}`}
			aria-hidden
		>
			<div className="grid grid-cols-3 gap-1.5">
				{cells.map((kind, i) => (
					<MiniBoard key={i} kind={kind} />
				))}
			</div>
			{showCaption ? (
				<p className="mt-3 text-center text-[10px] font-medium uppercase tracking-wider text-muted">
					9 small boards · 1 meta-grid
				</p>
			) : null}
		</div>
	);
}

function MiniBoard({ kind }: { kind: "empty" | "x" | "o" | "closed" | "active" }) {
	const marks: Array<"x" | "o" | null> =
		kind === "x"
			? ["x", "x", "x", null, null, null, null, null, null]
			: kind === "o"
				? ["o", null, null, null, "o", null, null, null, "o"]
				: kind === "closed"
					? ["x", "o", "x", "o", "x", "o", "o", "x", "o"]
					: kind === "active"
						? ["x", null, null, null, "o", null, null, null, null]
						: [null, null, null, null, null, null, null, null, null];

	const ring =
		kind === "active"
			? "ring-2 ring-accent shadow-[0_0_12px_var(--color-active-board)]"
			: "";
	const showClaimOverlay = kind === "x" || kind === "o";
	const claimPlayer = kind === "x" ? "X" : kind === "o" ? "O" : null;

	return (
		<div className={`relative aspect-square rounded-sm bg-bg/80 p-0.5 ${ring}`}>
			<div className="grid h-full w-full grid-cols-3 gap-px">
				{marks.map((mark, i) => (
					<span
						key={i}
						className="flex items-center justify-center rounded-[1px] bg-surface-elevated/80"
					>
						{mark === "x" ? (
							<PlayerMark player="X" size="mini" />
						) : mark === "o" ? (
							<PlayerMark player="O" size="mini" />
						) : null}
					</span>
				))}
			</div>
			{showClaimOverlay && claimPlayer ? (
				<div
					className={`pointer-events-none absolute inset-0 flex items-center justify-center rounded-sm ${
						claimPlayer === "X" ? "bg-playerX/10" : "bg-playerO/10"
					}`}
				>
					<PlayerMark player={claimPlayer} size="claim" />
				</div>
			) : null}
		</div>
	);
}
