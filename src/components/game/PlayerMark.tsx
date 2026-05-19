import type { Player } from "@shared/game/types";
import type { SVGAttributes } from "react";

const sizeClass = {
	cell: "h-[70%] w-[70%] max-h-8 max-w-8",
	mini: "h-1.5 w-1.5",
	claim: "h-5 w-5 sm:h-6 sm:w-6",
	board: "h-16 w-16 sm:h-20 sm:w-20",
	hero: "h-20 w-20 sm:h-24 sm:w-24",
} as const;

export type PlayerMarkSize = keyof typeof sizeClass;

function markColorClass(player: Player) {
	return player === "X" ? "text-playerX" : "text-playerO";
}

function MarkX({ className, ...props }: SVGAttributes<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2.75}
			strokeLinecap="round"
			className={className}
			aria-hidden
			{...props}
		>
			<line x1="5" y1="5" x2="19" y2="19" />
			<line x1="19" y1="5" x2="5" y2="19" />
		</svg>
	);
}

function MarkO({ className, ...props }: SVGAttributes<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2.75}
			className={className}
			aria-hidden
			{...props}
		>
			<circle cx="12" cy="12" r="7.25" />
		</svg>
	);
}

export function PlayerMark({
	player,
	size = "cell",
	className = "",
	glow = false,
	...props
}: {
	player: Player;
	size?: PlayerMarkSize;
	glow?: boolean;
} & SVGAttributes<SVGSVGElement>) {
	const glowStyle = glow
		? {
				filter:
					player === "X"
						? "drop-shadow(0 0 24px color-mix(in srgb, var(--color-x) 50%, transparent))"
						: "drop-shadow(0 0 24px color-mix(in srgb, var(--color-o) 50%, transparent))",
			}
		: undefined;

	const classes = `${sizeClass[size]} shrink-0 ${markColorClass(player)} ${className}`.trim();
	const Mark = player === "X" ? MarkX : MarkO;

	return <Mark className={classes} style={glowStyle} {...props} />;
}
