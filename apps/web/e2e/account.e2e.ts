import { expect, test } from "@playwright/test";
import { goTo, PASSWORD, signUp } from "./helpers";

test.describe("accounts", () => {
  test("sign up, answer the three questions, see leads, sign out and back in", async ({ page }) => {
    const { email } = await signUp(page, { name: "Account Tester" });
    await expect(page.getByText("Please confirm your email.")).toBeVisible();

    await page.getByRole("button", { name: "Sign out" }).first().click();
    await expect(page.getByRole("heading", { name: "Sign in to Kestlow" })).toBeVisible();

    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    // Onboarding was answered, so it goes straight to the leads.
    await expect(page.getByRole("heading", { name: "New leads near you" })).toBeVisible();

    await goTo(page, "Account");
    await expect(page.getByText(email, { exact: true })).toBeVisible();
  });

  test("the sign-up form links to the terms and privacy notice", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Create an account" }).click();

    await expect(page.getByRole("link", { name: "terms of service" })).toHaveAttribute(
      "href",
      "/terms",
    );
    await expect(page.getByRole("link", { name: "privacy notice" })).toHaveAttribute(
      "href",
      "/privacy",
    );
  });
});
