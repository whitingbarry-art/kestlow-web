import { expect, test } from "@playwright/test";
import { PASSWORD, signUp, testEmail } from "./helpers";

test.describe("the launch page (KES-125)", () => {
  test("a counter card's QR code goes to the jobs page, keeping the shop's code (KES-155)", async ({
    page,
  }) => {
    await page.goto("/waitlist/?ref=e2e-card");

    await expect(page).toHaveURL(/\/jobs\?ref=e2e-card$/);
    await expect(page.getByRole("heading", { level: 1, name: "Jobs near you" })).toBeVisible();
  });

  test("the launch page leads to the free trial, keeping the card or ad's code", async ({
    page,
  }) => {
    await page.goto("/?ref=e2e-card");
    await expect(page).toHaveTitle("Kestlow™: planning leads for tradespeople");

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

  test("kestlow.co.uk shows the launch page signed out, with a way to sign in", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Hear about building work while it’s still being planned",
    );

    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: "Sign in to Kestlow" })).toBeVisible();
  });

  test("someone signed in goes straight to their leads", async ({ page }) => {
    await signUp(page, { name: "Return Tester" });

    await page.goto("/");
    await expect(page.getByRole("heading", { name: "New leads near you" })).toBeVisible();
  });
});
