import { expect, test } from "@playwright/test";

// What search engines see (KES-135): a real robots.txt and sitemap, and on every page in the
// sitemap, a description and kestlow.co.uk as its one address.
test.describe("search engines", () => {
  test("get a robots.txt, not the home page", async ({ request }) => {
    const response = await request.get("/robots.txt");

    expect(response.ok()).toBe(true);
    expect(await response.text()).toMatch(/^# Kestlow/);
  });

  test("find a description and one address on every page in the sitemap", async ({
    page,
    request,
  }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    const urls = [...sitemap.matchAll(/<loc>(.+?)<\/loc>/g)].map(([, url]) => url);
    expect(urls.length).toBeGreaterThan(1);

    for (const url of urls) {
      await page.goto(new URL(url).pathname);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", url);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{40,}/);
      await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    }
  });

  test("are pointed from the old waitlist address to the launch page's", async ({ page }) => {
    await page.goto("/waitlist/?ref=screwfix-bromley");

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://kestlow.co.uk/",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  });
});
