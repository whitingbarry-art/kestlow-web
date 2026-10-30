import { expect, test } from "@playwright/test";
import { goTo, signUp } from "./helpers";

// Stripe itself isn't driven here: that's the sandbox walk-through in KES-50's PR. These check
// what Kestlow shows around it.
test.describe("plans and prices", () => {
  test("Account shows the plan, and leads to the plans with monthly and yearly prices", async ({
    page,
  }) => {
    await signUp(page, { name: "Pricing Tester" });
    await goTo(page, "Account");
    await expect(page.getByRole("heading", { name: "Your plan" })).toBeVisible();

    await page.getByRole("link", { name: "See plans and prices" }).click();
    await expect(page).toHaveURL("/pricing");
    await expect(page.getByRole("heading", { name: "Choose your plan" })).toBeVisible();
    await expect(page.getByText("£49", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Yearly, 2 months free" }).click();
    await expect(page.getByText("£490", { exact: true })).toBeVisible();
  });

  test("the free trial waits for a confirmed email", async ({ page }) => {
    await signUp(page, { name: "Trial Tester" });
    await expect(
      page.getByText(/your free 14-day Pro trial start once you've used it/),
    ).toBeVisible();

    await page.goto("/pricing");
    await page.getByRole("button", { name: "Start my free trial" }).click();
    await expect(page.getByRole("status")).toHaveText(
      "We couldn't start your free trial. Please confirm your email first.",
    );
  });
});
