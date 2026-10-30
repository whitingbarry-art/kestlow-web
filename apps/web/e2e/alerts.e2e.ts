import { devices, expect, test } from "@playwright/test";
import { goTo, signUp } from "./helpers";

test.describe("alerts", () => {
  test("push says honestly when alerts come", async ({ page }) => {
    await signUp(page, { name: "Alerts Tester" });
    await goTo(page, "Alerts");

    await expect(page.getByText("Each evening, as new leads come in")).toBeVisible();
  });

  test.describe("on an iPhone, in Safari", () => {
    // Chrome dressed as an iPhone: its size, touch and identity, which is what Kestlow checks.
    const { userAgent, viewport, deviceScaleFactor, isMobile, hasTouch } = devices["iPhone 15"];
    test.use({ userAgent, viewport, deviceScaleFactor, isMobile, hasTouch });

    test("the Push switch explains how to add Kestlow to the Home Screen", async ({ page }) => {
      await signUp(page, { name: "iPhone Tester" });
      await goTo(page, "Alerts");

      await page.getByRole("switch", { name: /Push notifications/ }).click();
      await expect(page.getByText(/Tap the Share button, choose Add to Home Screen/)).toBeVisible();
      await expect(page.getByRole("switch", { name: /Push notifications/ })).toHaveAttribute(
        "aria-checked",
        "false",
      );
    });
  });
});
