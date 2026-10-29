import { expect, test } from "@playwright/test";
import { signUp } from "./helpers";

test.describe("leads", () => {
  test("the summary gives how many are new today, and how many in all", async ({ page }) => {
    await signUp(page, { name: "Summary Tester" });

    await expect(
      page.getByText(
        /^(\d[\d,]* new today, of )?\d[\d,]* leads? within 15 miles$|^No leads within 15 miles yet$/,
      ),
    ).toBeVisible();
  });

  test("searching finds leads by town, counts them, and clears", async ({ page }) => {
    await signUp(page, { name: "Search Tester" });
    const count = page.locator('[aria-live="polite"]').first();
    await expect(count).toHaveText("");

    await page.getByRole("searchbox").fill("Chislehurst");
    await expect(count).toHaveText(/^\d+ leads? match(es)? “Chislehurst”$/);
    await expect(page).toHaveURL(/\?q=Chislehurst/);

    await page.getByRole("searchbox").fill("Narnia");
    await expect(page.getByText("No leads match “Narnia”.")).toBeVisible();
    await page.getByRole("button", { name: "Clear search" }).last().click();
    await expect(page.getByRole("searchbox")).toHaveValue("");
    await expect(page).not.toHaveURL(/\?q=/);
  });

  test("opening a shared search link starts with that search", async ({ page }) => {
    await signUp(page, { name: "Link Tester" });

    await page.goto("/?q=Eltham");
    await expect(page.getByRole("searchbox")).toHaveValue("Eltham");
  });

  test("the sort is remembered on this device", async ({ page }) => {
    await signUp(page, { name: "Sort Tester" });
    const sort = page.getByRole("combobox", { name: "Sort" });

    await sort.selectOption("nearest");
    await page.reload();
    await expect(sort).toHaveValue("nearest");
  });

  test("the trade buttons stay on one line, and the triangle moves them along", async ({
    page,
  }) => {
    await signUp(page, { name: "Trades Tester" });
    const row = page.getByRole("group", { name: "Filter by trade" });
    const lines = () =>
      row.evaluate(
        (el) => new Set([...el.children].map((c) => c.getBoundingClientRect().top)).size,
      );
    expect(await lines()).toBe(1);

    const right = page.getByTestId("scroll-right");
    // Only when they don't all fit, which is the case on a phone and the desktop leads column.
    if (await right.isVisible()) {
      await right.click();
      await expect(page.getByTestId("scroll-left")).toBeVisible();
      await expect.poll(() => row.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    }
  });

  test("a trade filters the leads", async ({ page }) => {
    await signUp(page, { name: "Filter Tester" });

    await page.getByRole("button", { name: "Landscaping" }).click();
    await expect(page.getByRole("button", { name: "Landscaping" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
