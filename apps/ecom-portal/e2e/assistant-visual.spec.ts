// Created for Phase 8 — visual-regression baselines for the assistant panel.
//
// Each fixture conversation (shared with the unit render test) is seeded into
// the assistant history store, resumed through the real History UI, then
// screenshotted at 390 / 520 / 720 px in both light and dark themes.
//
// Baselines are intentionally NOT committed by this file; generate/refresh them
// once the dev server + browsers are available with:
//   pnpm e2e -g "assistant visual" --update-snapshots
import { expect, test, type Page } from "@playwright/test";

import {
  ASSISTANT_FIXTURES,
  fixtureToArchive,
} from "../src/features/assistant/__fixtures__/conversations";

/** sessionStorage key used by the assistant history persist middleware. */
const HISTORY_KEY = "ecom-assistant-history";

const WIDTHS = [390, 520, 720] as const;
const THEMES = ["light", "dark"] as const;

/** Seed every fixture as an archived conversation before the app boots. */
async function seedHistory(page: Page): Promise<void> {
  const archive = ASSISTANT_FIXTURES.map(fixtureToArchive);
  const payload = JSON.stringify({ state: { archive }, version: 2 });
  await page.addInitScript(
    ([key, value]) => {
      window.sessionStorage.setItem(key, value);
    },
    [HISTORY_KEY, payload] as const,
  );
}

async function login(page: Page): Promise<void> {
  await page.goto("/");
  const loginBtn = page.getByRole("button", { name: /login/i }).first();
  if (await loginBtn.isVisible().catch(() => false)) {
    await loginBtn.click();
  }
  await page.getByLabel(/user|email|login/i).first().fill("test");
  await page.getByLabel(/password/i).first().fill("test");
  await page
    .getByRole("button", { name: /sign in|login|submit/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/app\//, { timeout: 30_000 });
}

async function setTheme(page: Page, theme: (typeof THEMES)[number]): Promise<void> {
  if (theme !== "dark") return;
  const toggle = page.getByRole("switch", { name: /dark theme/i }).first();
  if (await toggle.isVisible().catch(() => false)) {
    await toggle.click();
  }
}

async function openAssistant(page: Page): Promise<void> {
  await page.getByRole("button", { name: /assistant/i }).click();
  await expect(page.getByPlaceholder(/ask about/i)).toBeVisible();
}

async function resumeFixture(page: Page, title: string): Promise<void> {
  // Open the history pane, click the fixture row, which resumes it into chat.
  await page.getByRole("button", { name: /history/i }).click();
  await page.getByRole("button", { name: title, exact: false }).click();
  // Back in the chat view, the user turn for this fixture is visible.
  await expect(
    page.locator(".assistant-messages").getByText(title).first(),
  ).toBeVisible({ timeout: 10_000 });
}

test.describe("assistant visual regression", () => {
  for (const theme of THEMES) {
    for (const width of WIDTHS) {
      for (const fixture of ASSISTANT_FIXTURES) {
        test(`${fixture.key} @ ${width}px ${theme}`, async ({ page }) => {
          await page.setViewportSize({ width, height: 900 });
          await seedHistory(page);
          await login(page);
          await setTheme(page, theme);
          await openAssistant(page);
          await resumeFixture(page, fixture.title);

          const window = page.locator(".assistant-window");
          await expect(window).toHaveScreenshot(
            `${fixture.key}-${width}-${theme}.png`,
            {
              // Timestamps and the typing caret must not make a baseline flap.
              mask: [page.locator(".assistant-time")],
              animations: "disabled",
              maxDiffPixelRatio: 0.01,
            },
          );
        });
      }
    }
  }
});
