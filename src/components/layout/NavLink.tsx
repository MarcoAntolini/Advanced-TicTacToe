"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavItem } from "@/lib/navigation";
import { isNavActive } from "@/lib/navigation";

export function NavLink({
	item,
	className = "",
	onNavigate,
	variant = "header",
}: {
	item: NavItem;
	className?: string;
	onNavigate?: () => void;
	variant?: "header" | "drawer";
}) {
	const pathname = usePathname();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const active = mounted && isNavActive(pathname, item);
	const Icon = item.icon;

	const base =
		variant === "drawer"
			? "w-full justify-start rounded-lg px-3 py-2.5"
			: "rounded-md px-3 py-2";

	const state = active
		? variant === "drawer"
			? "bg-accent/10 text-accent"
			: "text-foreground"
		: "text-muted hover:bg-surface-elevated/80 hover:text-foreground";

	return (
		<Link
			href={item.href}
			onClick={onNavigate}
			aria-current={active ? "page" : undefined}
			className={`relative inline-flex min-h-10 items-center gap-2 text-sm font-medium transition-colors ${base} ${state} ${className}`}
		>
			<Icon className="h-4 w-4 shrink-0" aria-hidden />
			{item.label}
			{active && variant === "header" ? (
				<span
					className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent"
					aria-hidden
				/>
			) : null}
		</Link>
	);
}
