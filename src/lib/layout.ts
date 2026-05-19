/**
 * Page content width tiers — see design-system/MASTER.md § Content width.
 * Apply on the outermost page or flow wrapper inside `<main>`.
 */
export const contentWidth = {
	/** Card-stack pages: `/play`, `/play/online`, `/activity` */
	standard: "mx-auto w-full max-w-3xl",
	/** Game board — wider than join forms, smaller than play hub cards */
	game: "mx-auto w-full max-w-2xl",
	/** Long-form reading: `/rules` */
	prose: "mx-auto w-full max-w-4xl",
	/** Focused flows: join, short forms */
	narrow: "mx-auto w-full max-w-lg",
} as const;

/** Optional cap for hero lead copy — typography measure, not page column width. */
export const heroTextWidth = "max-w-2xl";
