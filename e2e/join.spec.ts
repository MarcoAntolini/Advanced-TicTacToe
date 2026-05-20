import { test, expect } from "@playwright/test";

test("join page accepts room code input", async ({ page }) => {
	await page.goto("/join");
	await expect(page.getByRole("heading", { name: "Join a game" })).toBeVisible();

	const joinButton = page.getByRole("button", { name: "Join game" });
	await expect(joinButton).toBeDisabled();

	await page.getByLabel("Room code").fill("ab12");
	await expect(joinButton).toBeEnabled();
	await expect(page.getByLabel("Room code")).toHaveValue("AB12");
});

test("join code URL pre-fills input without auto-joining short codes", async ({ page }) => {
	await page.goto("/join/abc");
	await expect(page.getByLabel("Room code")).toHaveValue("ABC");
});
