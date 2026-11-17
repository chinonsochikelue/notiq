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
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/", { waitUntil: "networkidle" });
    const editor = page.locator(".editor-content").first();
    await expect(editor).toBeVisible();
    await editor.click({ position: { x: 40, y: 40 } });
    await page.keyboard.type("Hello Notiq");
    await page.keyboard.press("Enter");
    await expect(editor).toContainText("Hello Notiq");

    expect(errors).toEqual([]);
    const undoButton = page.getByRole("button", { name: "Undo" });
    await expect(undoButton).toBeVisible();
    await expect(undoButton).toBeEnabled({ timeout: 10_000 });

    await undoButton.click();
    const redoButton = page.getByRole("button", { name: "Redo" });
    await expect(redoButton).toBeEnabled();
  });
});
