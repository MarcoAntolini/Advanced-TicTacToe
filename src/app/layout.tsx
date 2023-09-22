import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import React from "react";
import ConvexClientProvider from "./ConvexClientProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Advanced TicTacToe",
	description: "",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<NextTopLoader />
				<ConvexClientProvider>{children}</ConvexClientProvider>
			</body>
		</html>
	);
}
