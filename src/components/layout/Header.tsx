import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.webp";
import { HeaderClient } from "./HeaderClient";

export function Header() {
	return (
		<header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
			<div className="flex h-14 w-full items-center gap-3 px-4 sm:gap-6 sm:px-6 lg:px-8">
				<Link
					href="/"
					aria-label="Ultimate TTT — home"
					className="flex shrink-0 items-center gap-2.5 rounded-md font-semibold tracking-tight text-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent"
				>
					<Image
						src={logo}
						alt=""
						width={32}
						height={32}
						className="h-8 w-8 shrink-0 object-cover"
						priority
					/>
					<span className="hidden text-[15px] sm:inline">Ultimate TTT</span>
				</Link>

				<HeaderClient />
			</div>
		</header>
	);
}
