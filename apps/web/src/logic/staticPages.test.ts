import { withPageMeta } from "./staticPages";

const INDEX = `<!doctype html>
<html lang="en-GB">
  <head>
    <title>Kestlow</title>
    <meta
      name="description"
      content="The launch page."
    />
    <meta property="og:title" content="Kestlow: planning leads" />
    <meta property="og:description" content="The launch page." />
    <meta property="og:url" content="https://kestlow.co.uk/" />
  </head>
  <body></body>
</html>`;

describe("withPageMeta", () => {
  it("writes the page's title, description, previews and address into the HTML", () => {
    const html = withPageMeta(INDEX, {
      path: "/roofing-leads/bromley",
      heading: "Roofing leads in Bromley",
      title: "Roofing leads in Bromley – Kestlow",
      description: "Leads for roofers & more.",
    });

    expect(html).toContain("<title>Roofing leads in Bromley – Kestlow</title>");
    expect(html).toMatch(/name="description"\s+content="Leads for roofers &amp; more."/);
    expect(html).toContain(
      '<meta property="og:title" content="Roofing leads in Bromley – Kestlow" />',
    );
    expect(html).toContain(
      '<meta property="og:description" content="Leads for roofers &amp; more." />',
    );
    expect(html).toContain(
      '<meta property="og:url" content="https://kestlow.co.uk/roofing-leads/bromley" />',
    );
    expect(html).toContain(
      '<link rel="canonical" href="https://kestlow.co.uk/roofing-leads/bromley" />\n  </head>',
    );
    expect(html).not.toContain("The launch page.");
  });

  it("fails the build if index.html loses a tag it needs", () => {
    expect(() =>
      withPageMeta("<html><head><title>x</title></head></html>", {
        path: "/",
        heading: "x",
        title: "x",
        description: "x",
      }),
    ).toThrow('index.html has no <meta name="description">');
  });
});
