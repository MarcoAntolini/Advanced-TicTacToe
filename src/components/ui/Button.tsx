import { ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant;
	loading?: boolean;
}

export const buttonVariantClasses: Record<Variant, string> = {
	primary:
		"bg-accent text-white hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
	secondary:
		"bg-surface-elevated text-foreground border border-border hover:bg-surface focus-visible:ring-2 focus-visible:ring-accent",
	ghost: "text-foreground hover:bg-surface-elevated focus-visible:ring-2 focus-visible:ring-accent",
	danger: "bg-danger/20 text-danger hover:bg-danger/30 focus-visible:ring-2 focus-visible:ring-danger",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className = "", variant = "primary", loading, disabled, children, ...props }, ref) => {
		return (
			<button
				ref={ref}
				type="button"
				disabled={disabled || loading}
				className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-base font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${buttonVariantClasses[variant]} ${className}`}
				{...props}
			>
				{loading ? (
					<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
				) : null}
				{children}
			</button>
		);
	},
);

Button.displayName = "Button";

const buttonLookBase =
	"inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-base font-medium transition-colors duration-200";

/** Visual-only button styles for use inside `<a>` or outer `<button>` card wrappers. */
export function ButtonLook({
	variant = "primary",
	className = "",
	children,
}: {
	variant?: Variant;
	className?: string;
	children: ReactNode;
}) {
	return (
		<span className={`${buttonLookBase} ${buttonVariantClasses[variant]} ${className}`}>
			{children}
		</span>
	);
}
