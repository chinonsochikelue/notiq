import { test, expect } from "@playwright/test";

test.describe("Notiq Playground & Routes", () => {
  test("renders main playground and navigates to /collaboration and /framework", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");
    await expect(page.getByText("Notiq").first()).toBeVisible();

    // Ensure no horizontal page overflow on mobile or desktop
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2
    );
    expect(hasOverflow).toBe(false);

    // Navigate to /collaboration
    await page.getByRole("link", { name: /Collaborate/i }).click();
    await expect(page).toHaveURL(/\/collaboration/);

    const collabOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2
    );
    expect(collabOverflow).toBe(false);

    // Navigate back to / and then to /framework
    await page.goto("/framework");
    await expect(page.getByText("Notiq").first()).toBeVisible();

    if (!isMobile) {
      await expect(page.getByRole("link", { name: "Playground" })).toBeVisible();
    }
  });

  test("toolbar activates Undo/Redo after typing", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const firstParagraph = page.locator("#lexical-editor p").first();
    await expect(firstParagraph).toBeVisible();
    await firstParagraph.click();
    await page.keyboard.type(" Hello Notiq");
    await expect(firstParagraph).toContainText("Hello Notiq");

    const undoButton = page.getByRole("button", { name: "Undo" });
    await expect(undoButton).toBeVisible();
    await expect(undoButton).toBeEnabled();

    await undoButton.click();
    const redoButton = page.getByRole("button", { name: "Redo" });
    await expect(redoButton).toBeEnabled();
  });
});
