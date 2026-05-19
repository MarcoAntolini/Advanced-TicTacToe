import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function PlayBreadcrumb({ label }: { label: string }) {
	return (
		<nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-muted">
			<Link href="/play" className="hover:text-accent">
				Play
			</Link>
			<ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
			<span className="font-medium text-foreground">{label}</span>
		</nav>
	);
}
