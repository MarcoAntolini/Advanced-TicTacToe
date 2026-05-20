import { test, expect } from "@playwright/test";

test("local game allows moves and restart", async ({ page }) => {
	await page.goto("/play/local", { waitUntil: "domcontentloaded" });
	await expect(page.getByText(/local game/i)).toBeVisible();

	const cell = page.getByRole("button", { name: "Empty cell" }).first();
	await cell.click();
	await expect(page.getByRole("button", { name: "Cell X" }).first()).toBeVisible();

	await page.getByRole("button", { name: "Restart" }).click();
	await expect(page.getByRole("button", { name: "Empty cell" }).first()).toBeVisible();
});

test("local game back link returns to play hub", async ({ page }) => {
	await page.goto("/play/local", { waitUntil: "domcontentloaded" });
	await expect(page.getByRole("button", { name: "Empty cell" }).first()).toBeVisible();
	await page.getByRole("link", { name: "Back to play" }).click();
	await expect(page).toHaveURL("/play");
});
