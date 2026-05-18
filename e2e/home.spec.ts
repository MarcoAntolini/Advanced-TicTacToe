import { test, expect } from "@playwright/test";

test("home page shows play modes", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByRole("heading", { name: /Ultimate Tic-Tac-Toe/i })).toBeVisible();
	await expect(page.getByRole("link", { name: /Play local/i })).toBeVisible();
	await expect(page.getByRole("link", { name: /Play realtime/i })).toBeVisible();
});

test("local game allows moves", async ({ page }) => {
	await page.goto("/play/local");
	await expect(page.getByRole("heading", { name: /local game/i })).toBeVisible();
	const cell = page.getByRole("button", { name: "Empty cell" }).first();
	await cell.click();
	await expect(page.getByRole("button", { name: "Cell X" }).first()).toBeVisible();
});
