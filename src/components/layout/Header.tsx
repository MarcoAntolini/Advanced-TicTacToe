import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { AuthNav } from "./AuthNav";

export function Header() {
	return (
		<header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
			<div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
				<Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
					<Gamepad2 className="h-6 w-6 text-accent" aria-hidden />
					<span>Advanced TicTacToe</span>
				</Link>
				<nav className="flex items-center gap-4 text-sm">
					<Link href="/play/local" className="text-muted hover:text-foreground">
						Local
					</Link>
					<Link href="/play/online" className="text-muted hover:text-foreground">
						Online
					</Link>
					<AuthNav />
				</nav>
			</div>
		</header>
	);
}
