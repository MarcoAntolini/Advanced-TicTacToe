import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				bg: "var(--color-bg)",
				surface: "var(--color-surface)",
				"surface-elevated": "var(--color-surface-elevated)",
				border: "var(--color-border)",
				foreground: "var(--color-text)",
				muted: "var(--color-text-muted)",
				playerX: "var(--color-x)",
				playerO: "var(--color-o)",
				accent: "var(--color-accent)",
				"accent-hover": "var(--color-accent-hover)",
				success: "var(--color-success)",
				danger: "var(--color-danger)",
			},
			borderRadius: {
				sm: "var(--radius-sm)",
				md: "var(--radius-md)",
				lg: "var(--radius-lg)",
			},
		},
	},
	plugins: [],
};

export default config;
