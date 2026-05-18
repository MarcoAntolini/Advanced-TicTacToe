import { HTMLAttributes } from "react";

export function Badge({ className = "", children, ...props }: HTMLAttributes<HTMLSpanElement>) {
	return (
		<span
			className={`inline-flex items-center rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent ${className}`}
			{...props}
		>
			{children}
		</span>
	);
}
