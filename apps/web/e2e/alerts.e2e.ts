import { devices, expect, test } from "@playwright/test";
import { goTo, signUp } from "./helpers";

test.describe("alerts", () => {
  test("push says honestly when alerts come", async ({ page }) => {
    await signUp(page, { name: "Alerts Tester" });
    await goTo(page, "Alerts");

    await expect(page.getByText("Each evening, as new leads come in")).toBeVisible();
  });

  // A new account is on the free plan until its email is confirmed and its trial starts (KES-52),
  // and these tests can't confirm one yet, so they check what Free sees. The iPhone Home Screen
  // steps for paid plans are covered by useAlertSettings' tests.
  test.describe("on an iPhone, in Safari", () => {
    // Chrome dressed as an iPhone: its size, touch and identity, which is what Kestlow checks.
    const { userAgent, viewport, deviceScaleFactor, isMobile, hasTouch } = devices["iPhone 15"];
    test.use({ userAgent, viewport, deviceScaleFactor, isMobile, hasTouch });

    test("on the free plan, the Push switch says it comes with Solo and Pro", async ({ page }) => {
      await signUp(page, { name: "iPhone Tester" });
      await goTo(page, "Alerts");

      await page.getByRole("switch", { name: /Push notifications/ }).click();
      await expect(page.getByText("Push alerts come with Solo and Pro.")).toBeVisible();
      await expect(page.getByRole("switch", { name: /Push notifications/ })).toHaveAttribute(
        "aria-checked",
        "false",
      );
    });
  });
});
