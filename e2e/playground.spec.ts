import { test, expect } from "@playwright/test";

test.describe("Notiq Playground & Routes", () => {
  test("renders main playground and navigates to /collaboration and /framework without overflow", async ({
    page,
    isMobile,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Notiq").first()).toBeVisible();

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2
    );
    expect(hasOverflow).toBe(false);

    await page.getByRole("link", { name: /Collaborate/i }).click();
    await expect(page).toHaveURL(/\/collaboration/);

    const collabOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2
    );
    expect(collabOverflow).toBe(false);

    await page.goto("/framework", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Notiq").first()).toBeVisible();

    if (!isMobile) {
      await expect(page.getByRole("link", { name: "Playground" })).toBeVisible();
    }

    expect(errors).toEqual([]);
  });

  test("renders editor shell and toolbar controls cleanly", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".editor-content").first()).toBeVisible();

    const undoButton = page.getByRole("button", { name: "Undo" });
    const redoButton = page.getByRole("button", { name: "Redo" });
    await expect(undoButton).toBeVisible();
    await expect(redoButton).toBeVisible();

    if (isMobile) {
      await expect(
        page.getByRole("button", { name: "Format", exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Insert", exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Style", exact: true })
      ).toBeVisible();
    }
  });
});
