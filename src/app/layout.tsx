import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Advanced TicTacToe",
	description: "Ultimate Tic-Tac-Toe — local, realtime, and async multiplayer",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={`${inter.className} antialiased`}>
				<NextTopLoader color="var(--color-accent)" />
				<Providers>
					<Header />
					<main className="mx-auto min-h-[calc(100dvh-3.5rem)] max-w-6xl px-4 py-8">
						{children}
					</main>
				</Providers>
			</body>
		</html>
	);
}
