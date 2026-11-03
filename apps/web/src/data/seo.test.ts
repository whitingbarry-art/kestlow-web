import { readFileSync } from "node:fs";
import path from "node:path";
import { LAUNCH_DESCRIPTION, LAUNCH_TITLE } from "./launch";
import { SITE_LINKS } from "./navigation";

// The files crawlers read without running the app (KES-135), kept in step with the code.
const web = path.join(import.meta.dirname, "../..");
const read = (file: string) => readFileSync(path.join(web, file), "utf8");

describe("what search engines read", () => {
  it("lists the launch page and every page in the footer in the sitemap", () => {
    const listed = [...read("public/sitemap.xml").matchAll(/<loc>(.+?)<\/loc>/g)].map(
      ([, url]) => url,
    );

    expect(listed).toEqual([
      "https://kestlow.co.uk/",
      ...SITE_LINKS.map((link) => `https://kestlow.co.uk${link.href}`),
    ]);
  });

  it("keeps private pages out of search and points to the sitemap", () => {
    const robots = read("public/robots.txt");

    for (const path of ["/api/", "/pricing", "/reset-password", "/verify-email"])
      expect(robots).toContain(`Disallow: ${path}\n`);
    for (const link of SITE_LINKS) expect(robots).not.toContain(`Disallow: ${link.href}`);
    expect(robots).toContain("Sitemap: https://kestlow.co.uk/sitemap.xml");
  });

  it("gives crawlers without JavaScript the launch page's description", () => {
    for (const file of ["index.html", "waitlist/index.html"]) {
      const html = read(file);
      expect(html).toContain(`content="${LAUNCH_DESCRIPTION}"`);
      expect(html).toContain(`<meta property="og:title" content="${LAUNCH_TITLE}" />`);
    }
    expect(read("waitlist/index.html")).toContain(
      '<link rel="canonical" href="https://kestlow.co.uk/" />',
    );
  });

  it("asks search engines not to list the pages.dev addresses", () => {
    const headers = read("public/_headers");

    expect(headers).toContain("https://kestlow-web.pages.dev/*\n  X-Robots-Tag: noindex");
    expect(headers).toContain("https://:version.kestlow-web.pages.dev/*\n  X-Robots-Tag: noindex");
  });
});
