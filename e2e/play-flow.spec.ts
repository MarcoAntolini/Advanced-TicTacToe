import { test, expect } from "@playwright/test";

test("play wizard navigates choose → multiplayer → create and back", async ({ page }) => {
	await page.goto("/play", { waitUntil: "domcontentloaded" });
	await expect(page.getByRole("heading", { name: "Play", exact: true })).toBeVisible();

	await page.getByRole("button", { name: "Multiplayer" }).click();
	await expect(page).toHaveURL(/\/play\?step=multiplayer/);
	await expect(page.getByRole("heading", { name: "Multiplayer" })).toBeVisible();

	await page.getByRole("button", { name: "Create", exact: true }).click();
	await expect(page).toHaveURL(/\/play\?step=create/);
	await expect(page.getByRole("heading", { name: "Create game" })).toBeVisible();

	await page.getByRole("button", { name: "← Back" }).click();
	await expect(page).toHaveURL(/\/play\?step=multiplayer/);

	await page.getByRole("button", { name: "← Back" }).click();
	await expect(page).toHaveURL("/play");
});

test("play choose links to local game", async ({ page }) => {
	await page.goto("/play", { waitUntil: "domcontentloaded" });
	await page.getByRole("link", { name: /Play local/i }).click();
	await expect(page).toHaveURL("/play/local");
});

test("multiplayer step shows auto-find and join UI", async ({ page }) => {
	await page.goto("/play?step=multiplayer");
	await expect(page.getByRole("region", { name: "Auto-find opponent" })).toBeVisible();
	await expect(page.getByRole("button", { name: "Find match" }).first()).toBeVisible();
	await expect(page.getByRole("button", { name: "Browse", exact: true })).toBeVisible();
	await expect(page.getByLabel("Room code")).toBeVisible();
});

test("browse public games opens modal", async ({ page }) => {
	await page.goto("/play?step=multiplayer");
	await page.getByRole("button", { name: "Browse", exact: true }).click();
	await expect(page.getByRole("dialog", { name: "Public games" })).toBeVisible();
});

test("create step exposes visibility, pace, and rules", async ({ page }) => {
	await page.goto("/play?step=create");
	await expect(page.getByRole("radiogroup", { name: "Visibility" })).toBeVisible();
	await expect(page.getByRole("radiogroup", { name: "Pace" })).toBeVisible();
	await expect(page.getByRole("radiogroup", { name: "Rules" })).toBeVisible();
	await expect(page.getByRole("button", { name: "Create room" })).toBeVisible();
});

test("join code on play step requires four characters", async ({ page }) => {
	await page.goto("/play?step=multiplayer");
	const joinButton = page.getByRole("button", { name: "Join game" });
	await expect(joinButton).toBeDisabled();
	await page.getByLabel("Room code").fill("AB");
	await expect(joinButton).toBeDisabled();
	await page.getByLabel("Room code").fill("ABCD");
	await expect(joinButton).toBeEnabled();
});
