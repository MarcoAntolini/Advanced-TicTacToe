import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
	"inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-base font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"bg-accent text-white hover:bg-accent-hover focus-visible:ring-accent",
				destructive:
					"bg-danger/20 text-danger hover:bg-danger/30 focus-visible:ring-danger",
				outline:
					"border border-border bg-surface-elevated text-foreground hover:bg-surface focus-visible:ring-accent",
				secondary:
					"bg-surface-elevated text-foreground hover:bg-surface focus-visible:ring-accent",
				ghost: "text-foreground hover:bg-surface-elevated focus-visible:ring-accent",
				link: "text-accent underline-offset-4 hover:underline",
			},
			size: {
				default: "min-h-11 px-4 py-2",
				sm: "min-h-9 rounded-md px-3 text-sm",
				lg: "min-h-12 rounded-md px-8",
				icon: "h-11 w-11",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

type AppVariant = "primary" | "secondary" | "ghost" | "danger";

const variantMap = {
	primary: "default",
	secondary: "outline",
	ghost: "ghost",
	danger: "destructive",
} as const satisfies Record<AppVariant, NonNullable<VariantProps<typeof buttonVariants>["variant"]>>;

/** @deprecated Prefer `buttonVariants` for new code. */
export const buttonVariantClasses: Record<AppVariant, string> = {
	primary: buttonVariants({ variant: "default" }),
	secondary: buttonVariants({ variant: "outline" }),
	ghost: buttonVariants({ variant: "ghost" }),
	danger: buttonVariants({ variant: "destructive" }),
};

interface ShadcnButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const ShadcnButton = React.forwardRef<HTMLButtonElement, ShadcnButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
ShadcnButton.displayName = "ShadcnButton";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: AppVariant;
	loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className = "", variant = "primary", loading, disabled, children, type, ...props }, ref) => {
		return (
			<ShadcnButton
				ref={ref}
				type={type ?? "button"}
				variant={variantMap[variant]}
				disabled={disabled || loading}
				className={className}
				{...props}
			>
				{loading ? (
					<span
						className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
						aria-hidden
					/>
				) : null}
				{children}
			</ShadcnButton>
		);
	},
);

Button.displayName = "Button";

export function ButtonLook({
	variant = "primary",
	className = "",
	children,
}: {
	variant?: AppVariant;
	className?: string;
	children: ReactNode;
}) {
	return (
		<span className={cn(buttonVariantClasses[variant], className)}>{children}</span>
	);
}

export { ShadcnButton };
