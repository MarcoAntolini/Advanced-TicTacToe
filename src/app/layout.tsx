import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Advanced TicTacToe",
	description: "Ultimate Tic-Tac-Toe — local, realtime, and async multiplayer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");document.documentElement.dataset.theme=t||"${DEFAULT_THEME}"}catch(e){document.documentElement.dataset.theme="${DEFAULT_THEME}"}})();`;

	return (
		<html lang="en" data-theme={DEFAULT_THEME} suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</head>
			<body className={`${inter.className} antialiased`}>
				<NextTopLoader color="var(--color-accent)" showSpinner={false} />
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
