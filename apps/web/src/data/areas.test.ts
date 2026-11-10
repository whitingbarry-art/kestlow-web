import { AREA_PAGES, AREAS_INDEX_META, areaPageFor, areaPageMeta } from "./areas";

describe("the town and trade pages", () => {
  it("finds the page for a path, and nothing for any other", () => {
    expect(areaPageFor("/roofing-leads/bromley")).toMatchObject({
      trade: { trade: "Roofing" },
      council: { name: "Bromley" },
    });
    expect(areaPageFor("/groundworks-leads/dartford")?.council.region).toBe("Kent");
    // Paused after the council refused automated collection (KES-141).
    expect(areaPageFor("/groundworks-leads/tandridge")).toBeUndefined();
    for (const path of ["/roofing-leads/leeds", "/plumbing-leads/bromley", "/roofing-leads", "/"])
      expect(areaPageFor(path)).toBeUndefined();
  });

  it("has a page for each of the 4 trades in each of the 28 councils (KES-161)", () => {
    expect(AREA_PAGES).toHaveLength(112);
    expect(new Set(AREA_PAGES.map((page) => areaPageMeta(page).path)).size).toBe(112);
  });

  it("gives each one a title and a description that fits in a search result", () => {
    expect(areaPageMeta(areaPageFor("/electrical-leads/sevenoaks")!)).toEqual({
      path: "/electrical-leads/sevenoaks",
      heading: "Electrical leads in Sevenoaks",
      title: "Electrical leads in Sevenoaks – Kestlow™",
      description:
        "Planning applications in Sevenoaks that could need an electrician, sent to your phone every morning. For electricians in Kent. Try Pro free.",
    });
    for (const meta of [AREAS_INDEX_META, ...AREA_PAGES.map(areaPageMeta)])
      expect(meta.description.length).toBeLessThanOrEqual(160);
  });

  it("keeps every page's ref short enough for the API to count it", () => {
    for (const { trade, council } of AREA_PAGES)
      expect(`seo-${trade.slug}-${council.slug}`).toMatch(/^[a-z0-9][a-z0-9-]{0,39}$/);
  });
});
