import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
	darkMode: ["selector", '[data-theme]:not([data-theme="daylight"])'],
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
				border: "var(--border)",
				foreground: "var(--foreground)",
				muted: {
					DEFAULT: "var(--color-text-muted)",
					foreground: "var(--muted-foreground)",
				},
				playerX: "var(--color-x)",
				playerO: "var(--color-o)",
				accent: {
					DEFAULT: "var(--color-accent)",
					foreground: "var(--primary-foreground)",
				},
				"accent-hover": "var(--color-accent-hover)",
				success: "var(--color-success)",
				danger: "var(--color-danger)",
				background: "var(--background)",
				card: {
					DEFAULT: "var(--card)",
					foreground: "var(--card-foreground)",
				},
				popover: {
					DEFAULT: "var(--popover)",
					foreground: "var(--popover-foreground)",
				},
				primary: {
					DEFAULT: "var(--primary)",
					foreground: "var(--primary-foreground)",
				},
				secondary: {
					DEFAULT: "var(--secondary)",
					foreground: "var(--secondary-foreground)",
				},
				destructive: {
					DEFAULT: "var(--destructive)",
					foreground: "var(--destructive-foreground)",
				},
				input: "var(--input)",
				ring: "var(--ring)",
			},
			borderRadius: {
				sm: "var(--radius-sm)",
				md: "var(--radius-md)",
				lg: "var(--radius-lg)",
				xl: "calc(var(--radius-md) + 4px)",
			},
		},
	},
	plugins: [tailwindcssAnimate],
};

export default config;
