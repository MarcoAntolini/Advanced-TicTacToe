import { test, expect } from "@playwright/test";

test("legacy play routes redirect into the wizard", async ({ page }) => {
	await page.goto("/play/online");
	await expect(page).toHaveURL(/\/play\?step=multiplayer/, { timeout: 15_000 });

	await page.goto("/play/ranked");
	await expect(page).toHaveURL(/\/play\?step=multiplayer/, { timeout: 15_000 });

	await page.goto("/play/online?mode=async");
	await expect(page).toHaveURL(/\/play\?step=create&mode=async/, { timeout: 15_000 });
});
