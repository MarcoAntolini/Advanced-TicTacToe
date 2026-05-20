import { test, expect } from "@playwright/test";

test("home page shows hero and mode chips", async ({ page }) => {
	await page.goto("/");
	await expect(
		page.getByRole("heading", { name: /Nine boards/i }),
	).toBeVisible();
	await expect(page.getByRole("list", { name: "Game modes" })).toContainText("Local");
	await expect(page.getByRole("list", { name: "Game modes" })).toContainText("Realtime");
	await expect(page.getByRole("list", { name: "Game modes" })).toContainText("Async");
});

test("home rules card links to rules page", async ({ page }) => {
	await page.goto("/");
	await Promise.all([
		page.waitForURL("/rules"),
		page.getByRole("link", { name: /Read the rules/i }).click(),
	]);
	await expect(
		page.getByRole("heading", { name: /How to play Ultimate TTT/i }),
	).toBeVisible();
});
