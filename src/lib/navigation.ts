import type { LucideIcon } from "lucide-react";
import { BookOpen, Gamepad2 } from "lucide-react";

export type NavItem = {
	href: string;
	label: string;
	icon: LucideIcon;
	/** Path prefixes that mark this item active (defaults to href) */
	match?: string[];
};

/** Top-level app navigation — logo links home; keep this minimal. */
export const primaryNav: NavItem[] = [
	{
		href: "/play",
		label: "Play",
		icon: Gamepad2,
		match: ["/play", "/join", "/game"],
	},
	{ href: "/rules", label: "Rules", icon: BookOpen, match: ["/rules"] },
];

export function isNavActive(pathname: string, item: NavItem): boolean {
	const prefixes = item.match ?? [item.href];
	return prefixes.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
	);
}
