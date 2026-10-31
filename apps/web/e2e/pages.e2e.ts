import { expect, test } from "@playwright/test";

const PAGES = [
  ["About us", "/about", "About us – Kestlow"],
  ["Contact us", "/contact", "Contact us – Kestlow"],
  ["Terms", "/terms", "Terms of service – Kestlow"],
  ["Privacy", "/privacy", "Privacy notice – Kestlow"],
  ["Refunds", "/refunds", "Refund policy – Kestlow"],
] as const;

test.describe("the pages anyone can read", () => {
  for (const [label, path, title] of PAGES)
    test(`${label} opens from the footer, signed out`, async ({ page }) => {
      await page.goto("/");
      await page.locator("footer").getByRole("link", { name: label, exact: true }).click();

      await expect(page).toHaveURL(path);
      await expect(page).toHaveTitle(title);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });

  test("the privacy notice says how long error reports are kept", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByText("Error reports: 30 days.")).toBeVisible();
  });

  test("Contact us and the footer give Kestlow's address, and only the Terms name who runs it (KES-122, KES-124)", async ({
    page,
  }) => {
    await page.goto("/contact");

    await expect
      .poll(() => page.locator("address").innerText())
      .toBe("Kestlow\n4th Floor\n18 St. Cross Street\nLondon\nEC1N 8UN");
    const footer = page.locator("footer");
    await expect(footer).toContainText("Kestlow, 4th Floor, 18 St. Cross Street, London, EC1N 8UN");
    await expect(footer).not.toContainText("Barry Whiting");

    await footer.getByRole("link", { name: "Terms" }).click();
    await expect(page.getByText(/Barry Whiting, trading as Kestlow/)).toBeVisible();
  });

  test("the contact form lists what needs fixing, linked to each field", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send message" }).click();

    const summary = page.getByRole("group", { name: "Some answers need fixing" });
    await expect(summary).toBeFocused();
    await summary.getByRole("link", { name: "Enter your name." }).click();
    await expect(page.getByLabel("Your name")).toBeFocused();
  });
});
