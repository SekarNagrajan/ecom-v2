// Modified by Sekar Nagarajan (2026-10-20 13:05)
import { expect, test } from "@playwright/test";

test.describe("AI assistant", () => {
  test("login, open assistant, send hello, see stub text", async ({ page }) => {
    await page.goto("/");

    // Open login if on landing
    const loginBtn = page.getByRole("button", { name: /login/i }).first();
    if (await loginBtn.isVisible().catch(() => false)) {
      await loginBtn.click();
    }

    await page.getByLabel(/user|email|login/i).first().fill("test");
    await page.getByLabel(/password/i).first().fill("test");
    await page.getByRole("button", { name: /sign in|login|submit/i }).first().click();

    await expect(page).toHaveURL(/\/app\//, { timeout: 30_000 });

    await page.getByRole("button", { name: /assistant/i }).click();
    await expect(page.getByPlaceholder(/ask about/i)).toBeVisible();

    await page.getByPlaceholder(/ask about/i).fill("hello");
    await page.getByRole("button", { name: /^send$/i }).click();

    await expect(
      page.getByText(/e-com assistant stub/i),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("track SMLU8829102 triggers tool lookup UI", async ({ page }) => {
    await page.goto("/");

    const loginBtn = page.getByRole("button", { name: /login/i }).first();
    if (await loginBtn.isVisible().catch(() => false)) {
      await loginBtn.click();
    }

    await page.getByLabel(/user|email|login/i).first().fill("test");
    await page.getByLabel(/password/i).first().fill("test");
    await page.getByRole("button", { name: /sign in|login|submit/i }).first().click();

    await expect(page).toHaveURL(/\/app\//, { timeout: 30_000 });

    await page.getByRole("button", { name: /assistant/i }).click();
    await page.getByPlaceholder(/ask about/i).fill("track SMLU8829102");
    await page.getByRole("button", { name: /^send$/i }).click();

    await expect(page.getByText(/looking up|SMLU8829102|track/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
