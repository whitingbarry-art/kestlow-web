import { expect, test } from "@playwright/test";
import { PASSWORD, testEmail } from "./helpers";

test.describe("the launch page (KES-125)", () => {
  test("a counter card's QR code leads to the free trial, keeping the shop's code", async ({
    page,
  }) => {
    await page.goto("/waitlist/?ref=e2e-card");
    await expect(page).toHaveTitle("Kestlow: planning leads for tradespeople");

    await page.getByRole("link", { name: "Start your free 14-day trial" }).first().click();
    await expect(page).toHaveURL(/\/\?start=trial&ref=e2e-card$/);
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();

    await page.getByLabel("Your name").fill("Card Tester");
    await page.getByLabel("Email address").fill(testEmail("card"));
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByRole("heading", { name: "Where are you based?" })).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });
});
