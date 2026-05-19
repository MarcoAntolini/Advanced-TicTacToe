"use client";

import { Check, Palette } from "lucide-react";
import { themes, type ThemeDefinition, type ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "./ThemeProvider";

function ThemeSwatch({ option }: { option: ThemeDefinition }) {
	return (
		<span
			className="flex h-8 w-8 shrink-0 overflow-hidden rounded-md border border-border"
			aria-hidden
		>
			<span className="h-full w-1/3" style={{ backgroundColor: option.swatch[0] }} />
			<span className="h-full w-1/3" style={{ backgroundColor: option.swatch[1] }} />
			<span className="h-full w-1/3" style={{ backgroundColor: option.swatch[2] }} />
		</span>
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

	const triggerClass =
		variant === "drawer"
			? "w-full justify-start rounded-lg px-3 py-2.5"
			: "rounded-md px-2.5 py-2";

	const selectTheme = (themeId: ThemeId) => {
		setTheme(themeId);
		onSelect?.();
	};

	return (
		<DropdownMenu modal={variant === "header"}>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className={cn(
						"inline-flex min-h-9 items-center gap-2 text-sm font-medium text-muted transition-colors hover:bg-surface-elevated/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
						triggerClass,
					)}
					aria-label="Choose color theme"
				>
					<Palette className="h-4 w-4 shrink-0" aria-hidden />
					{variant === "drawer" ? "Theme" : null}
					<span className="sr-only">Theme</span>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align={variant === "drawer" ? "start" : "end"}
				side={variant === "drawer" ? "bottom" : "bottom"}
				className={cn(
					"w-72 p-0",
					variant === "drawer" && "w-[var(--radix-dropdown-menu-trigger-width)]",
				)}
			>
				<DropdownMenuRadioGroup
					value={theme}
					onValueChange={(value) => selectTheme(value as ThemeId)}
				>
					{themes.map((option) => (
						<DropdownMenuRadioItem
							key={option.id}
							value={option.id}
							className="flex cursor-pointer items-center gap-3 rounded-none px-3 py-2.5 pl-3 focus:bg-surface-elevated data-[state=checked]:bg-accent/10"
						>
							<ThemeSwatch option={option} />
							<span className="min-w-0 flex-1">
								<span className="block text-sm font-medium text-foreground">
									{option.label}
								</span>
								<span className="block truncate text-xs text-muted">
									{option.description}
								</span>
							</span>
							{option.id === theme ? (
								<Check className="h-4 w-4 shrink-0 text-accent" aria-hidden />
							) : (
								<span className="h-4 w-4 shrink-0" aria-hidden />
							)}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
