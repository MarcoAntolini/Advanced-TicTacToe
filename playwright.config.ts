import { defineConfig, devices } from "@playwright/test";

/** Dedicated port so E2E does not collide with a developer's `next dev` on 3000. */
const E2E_PORT = process.env.PLAYWRIGHT_PORT ?? "3099";
const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;

export default defineConfig({
	testDir: "e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 1,
	workers: 2,
	expect: { timeout: 15_000 },
	use: {
		baseURL: E2E_BASE_URL,
		trace: "on-first-retry",
		actionTimeout: 15_000,
	},
	webServer: {
		command: `npx next dev -p ${E2E_PORT}`,
		url: E2E_BASE_URL,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
