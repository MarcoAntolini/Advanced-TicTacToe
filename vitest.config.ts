import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		exclude: ["node_modules", "e2e/**"],
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@shared": path.resolve(__dirname, "./shared"),
			"@convex": path.resolve(__dirname, "./convex"),
		},
	},
});
