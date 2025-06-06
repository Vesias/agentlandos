import { test, expect } from "@playwright/test";

test.describe("AGENTLAND.SAARLAND Homepage", () => {
  test("should load homepage and display main content", async ({ page }) => {
    await page.goto("/");

    // Check that page loads
    await expect(page).toHaveTitle(/AGENTLAND/);

    // Check for main navigation
    await expect(page.locator("nav")).toBeVisible();

    // Check for main heading or content
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should have working navigation links", async ({ page }) => {
    await page.goto("/");

    // Test chat navigation
    const chatLink = page.locator('a[href*="/chat"]').first();
    if (await chatLink.isVisible()) {
      await chatLink.click();
      await expect(page).toHaveURL(/.*chat.*/);
    }
  });

  test("should be mobile responsive", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto("/");

    // Check that content is still visible on mobile
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("nav")).toBeVisible();
  });

  test("should have accessible elements", async ({ page }) => {
    await page.goto("/");

    // Check for basic accessibility requirements
    const buttons = await page.locator("button").count();
    const links = await page.locator("a").count();

    // Should have interactive elements
    expect(buttons + links).toBeGreaterThan(0);

    // Check for alt text on images (if any)
    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      expect(alt).toBeTruthy();
    }
  });
});
