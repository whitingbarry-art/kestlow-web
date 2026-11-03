import { renderHook } from "@testing-library/react";
import { usePageMeta } from "./usePageMeta";

const content = (selector: string) =>
  document.head.querySelector(selector)?.getAttribute("content") ?? null;

describe("usePageMeta", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
  });

  it("gives a public page its description and its kestlow.co.uk address", () => {
    window.history.replaceState(null, "", "/about?ref=ad-first");

    renderHook(() => usePageMeta({ title: "About us – Kestlow", description: "Who we are." }));

    expect(document.title).toBe("About us – Kestlow");
    expect(content('meta[name="description"]')).toBe("Who we are.");
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://kestlow.co.uk/about",
    );
    expect(content('meta[property="og:title"]')).toBe("About us – Kestlow");
    expect(content('meta[property="og:description"]')).toBe("Who we are.");
    expect(content('meta[property="og:url"]')).toBe("https://kestlow.co.uk/about");
  });

  it("uses the path it's given, so /waitlist/ points search engines at /", () => {
    window.history.replaceState(null, "", "/waitlist/?ref=screwfix-bromley");

    renderHook(() => usePageMeta({ title: "Kestlow", description: "Leads.", path: "/" }));

    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://kestlow.co.uk/",
    );
  });

  it("updates the tags already in the page rather than adding more", () => {
    document.head.innerHTML = '<meta name="description" content="From index.html">';

    renderHook(() => usePageMeta({ title: "Terms – Kestlow", description: "The terms." }));

    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(content('meta[name="description"]')).toBe("The terms.");
  });

  it("only sets the title for a page left out of search", () => {
    renderHook(() => usePageMeta({ title: "Plans and prices – Kestlow" }));

    expect(document.title).toBe("Plans and prices – Kestlow");
    expect(document.head.querySelector('meta[name="description"]')).toBeNull();
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
  });
});
