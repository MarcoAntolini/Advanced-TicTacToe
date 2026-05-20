import { test, expect } from "@playwright/test";

test("header primary nav reaches main pages", async ({ page }) => {
	await page.goto("/");

	await Promise.all([
		page.waitForURL("/play"),
		page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Play" }).click(),
	]);
	await expect(page.getByRole("heading", { name: "Play", exact: true })).toBeVisible();

	await Promise.all([
		page.waitForURL("/leaderboard"),
		page
			.getByRole("navigation", { name: "Main" })
			.getByRole("link", { name: "Leaderboard" })
			.click(),
	]);
	await expect(page.getByRole("heading", { name: "Leaderboard" })).toBeVisible();

	await Promise.all([
		page.waitForURL("/rules"),
		page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Rules" }).click(),
	]);
	await expect(
		page.getByRole("heading", { name: /How to play Ultimate TTT/i }),
	).toBeVisible();
});

test("logo returns home", async ({ page }) => {
	await page.goto("/play");
	await Promise.all([
		page.waitForURL("/"),
		page.getByRole("link", { name: /Ultimate TTT — home/i }).click(),
	]);
});

test("theme switcher opens and selects a theme", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Choose color theme" }).click();
	await page.getByRole("menuitemradio", { name: /Daylight/i }).click();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "daylight");
});
