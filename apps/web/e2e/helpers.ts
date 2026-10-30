import { expect, type Page } from "@playwright/test";

/** Test accounts use a reserved domain, so no real email is ever sent to them. */
export function testEmail(label: string) {
  return `e2e-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.invalid`;
}

export const PASSWORD = "ladder-teapot-rain-e2e";

/** Creates an account and answers the three onboarding questions, ending on Leads. */
export async function signUp(
  page: Page,
  { name = "E2E Tester", postcode = "BR1 1LT", trades = ["Roofing"] } = {},
) {
  const email = testEmail(name.toLowerCase().replace(/\W+/g, "-"));
  await page.goto("/");
  await page.getByRole("button", { name: "Create an account" }).click();
  await page.getByLabel("Your name").fill(name);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByLabel("Your postcode").fill(postcode);
  await page.getByRole("button", { name: "Continue" }).click();
  for (const trade of trades) await page.getByRole("checkbox", { name: trade }).check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Show my leads" }).click();
  await expect(page.getByRole("heading", { name: "New leads near you" })).toBeVisible();
  return { email, name };
}

/** The main navigation: the sidebar on a computer, the bottom bar on a phone. */
export async function goTo(page: Page, view: "Leads" | "Saved" | "Alerts" | "Account") {
  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: view }).click();
}
