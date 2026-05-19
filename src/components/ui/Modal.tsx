"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Modal({
	open,
	onClose,
	title,
	children,
}: {
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
}) {
	const titleId = useId();
	const panelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		panelRef.current?.focus();
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prev;
		};
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div
			className="animate-overlay-fade fixed inset-0 z-50 flex items-center justify-center p-4"
			role="presentation"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				tabIndex={-1}
				className="animate-overlay-scale max-h-[min(90vh,32rem)] w-full max-w-md overflow-hidden rounded-xl border border-border bg-surface shadow-xl outline-none"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
					<h2 id={titleId} className="text-lg font-semibold">
						{title}
					</h2>
					<Button
						type="button"
						variant="ghost"
						onClick={onClose}
						className="h-9 min-h-9 w-9 shrink-0 rounded-full p-0"
						aria-label="Close"
					>
						<X className="h-4 w-4" aria-hidden />
					</Button>
				</div>
				<div className="max-h-[calc(min(90vh,32rem)-3.5rem)] overflow-y-auto p-4">
					{children}
				</div>
			</div>
		</div>
	);
}
