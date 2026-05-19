"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className={cn(
			"fixed inset-0 z-[60] bg-bg/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
			className,
		)}
		{...props}
	/>
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
	<DialogPortal>
		<DialogOverlay />
		{/* Flex centering — slide animations must not override translate-based centering */}
		<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
			<DialogPrimitive.Content
				ref={ref}
				className={cn(
					"pointer-events-auto grid w-full max-w-md gap-0 overflow-hidden rounded-xl border border-border bg-card p-6 shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
					className,
				)}
				{...props}
			>
				{children}
			</DialogPrimitive.Content>
		</div>
	</DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col space-y-1.5 border-b border-border px-4 py-3 text-left",
			className,
		)}
		{...props}
	/>
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
		{...props}
	/>
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn("text-lg font-semibold leading-none tracking-tight", className)}
		{...props}
	/>
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn("text-sm text-muted", className)}
		{...props}
	/>
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

function DialogCloseButton({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof DialogClose>) {
	return (
		<DialogClose
			className={cn(
				"inline-flex h-9 min-h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground opacity-70 ring-offset-background transition-opacity hover:bg-surface-elevated hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
				className,
			)}
			{...props}
		>
			<X className="h-4 w-4" aria-hidden />
			<span className="sr-only">Close</span>
		</DialogClose>
	);
}

/** Standard app modal: titled header, scrollable body, Escape + backdrop close. */
function TitledDialog({
	open,
	onClose,
	title,
	children,
}: {
	open: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) onClose();
			}}
		>
			<DialogContent className="max-h-[min(90vh,32rem)] gap-0 p-0">
				<DialogHeader className="flex-row items-center justify-between gap-3 space-y-0">
					<DialogTitle>{title}</DialogTitle>
					<DialogCloseButton onClick={onClose} />
				</DialogHeader>
				<div className="max-h-[calc(min(90vh,32rem)-3.5rem)] overflow-y-auto p-4">
					{children}
				</div>
			</DialogContent>
		</Dialog>
	);
}

/** Centered game overlay; no dismiss via backdrop or Escape (use explicit actions). */
function GamePanelDialog({
	open,
	children,
	className,
}: {
	open: boolean;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<Dialog open={open}>
			<DialogContent
				className={cn(
					"gap-0 border-border/80 bg-surface/95 p-8 backdrop-blur-sm",
					className,
				)}
				onInteractOutside={(event) => event.preventDefault()}
				onEscapeKeyDown={(event) => event.preventDefault()}
			>
				{children}
			</DialogContent>
		</Dialog>
	);
}

export {
	Dialog,
	DialogPortal,
	DialogOverlay,
	DialogClose,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
	DialogCloseButton,
	TitledDialog,
	GamePanelDialog,
};
