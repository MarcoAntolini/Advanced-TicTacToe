"use client";

import { Check, Palette } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { themes, type ThemeDefinition, type ThemeId } from "@/lib/themes";
import { useTheme } from "./ThemeProvider";

function ThemeOption({
	option,
	active,
	onSelect,
}: {
	option: ThemeDefinition;
	active: boolean;
	onSelect: () => void;
}) {
	return (
		<button
			type="button"
			role="option"
			aria-selected={active}
			onClick={onSelect}
			className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-elevated ${
				active ? "bg-accent/10" : ""
			}`}
		>
			<span
				className="flex h-8 w-8 shrink-0 overflow-hidden rounded-md border border-border"
				aria-hidden
			>
				<span
					className="h-full w-1/3"
					style={{ backgroundColor: option.swatch[0] }}
				/>
				<span
					className="h-full w-1/3"
					style={{ backgroundColor: option.swatch[1] }}
				/>
				<span
					className="h-full w-1/3"
					style={{ backgroundColor: option.swatch[2] }}
				/>
			</span>
			<span className="min-w-0 flex-1">
				<span className="block text-sm font-medium text-foreground">
					{option.label}
				</span>
				<span className="block truncate text-xs text-muted">
					{option.description}
				</span>
			</span>
			{active ? (
				<Check className="h-4 w-4 shrink-0 text-accent" aria-hidden />
			) : (
				<span className="h-4 w-4 shrink-0" aria-hidden />
			)}
		</button>
	);
}

export function ThemeSwitcher({
	variant = "header",
	onSelect,
}: {
	variant?: "header" | "drawer";
	onSelect?: () => void;
}) {
	const { theme, setTheme } = useTheme();
	const [open, setOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const close = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", close);
		return () => document.removeEventListener("mousedown", close);
	}, [open]);

	const triggerClass =
		variant === "drawer"
			? "w-full justify-start rounded-lg px-3 py-2.5"
			: "rounded-md px-2.5 py-2";

	const panelClass =
		variant === "drawer"
			? "mt-2 overflow-hidden rounded-lg border border-border bg-surface-elevated"
			: "absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-lg border border-border bg-surface shadow-xl";

	const listClass =
		variant === "drawer"
			? ""
			: "max-h-[min(70vh,28rem)] overflow-y-auto overscroll-contain";

	const selectTheme = (themeId: ThemeId) => {
		setTheme(themeId);
		setOpen(false);
		onSelect?.();
	};

	return (
		<div className="relative" ref={menuRef}>
			<button
				type="button"
				onClick={() => setOpen((value) => !value)}
				className={`inline-flex min-h-9 items-center gap-2 text-sm font-medium text-muted transition-colors hover:bg-surface-elevated/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${triggerClass}`}
				aria-expanded={open}
				aria-haspopup="listbox"
				aria-label="Choose color theme"
			>
				<Palette className="h-4 w-4 shrink-0" aria-hidden />
				{variant === "drawer" ? "Theme" : null}
				<span className="sr-only">Theme</span>
			</button>

			{open ? (
				<div role="listbox" aria-label="Color themes" className={panelClass}>
					<div className={listClass}>
						{themes.map((option) => (
							<ThemeOption
								key={option.id}
								option={option}
								active={option.id === theme}
								onSelect={() => selectTheme(option.id)}
							/>
						))}
					</div>
				</div>
			) : null}
		</div>
	);
}
