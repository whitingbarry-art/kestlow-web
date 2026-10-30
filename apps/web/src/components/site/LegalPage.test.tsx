import { render, screen, within } from "@testing-library/react";
import { BUSINESS_ADDRESS } from "../../data/contact";
import { icoRegistration, PRIVACY, REFUNDS, TERMS, type LegalDocument } from "../../data/legal";
import { LegalPage } from "./LegalPage";

const DOCUMENT: LegalDocument = {
  title: "Test policy",
  updated: "1 January 2027",
  intro: ["Email privacy@kestlow.co.uk or see https://ico.org.uk."],
  sections: [
    { heading: "Lists", blocks: ["Before.", { list: ["One", "Two, at hello@kestlow.co.uk"] }] },
  ],
};

describe("LegalPage", () => {
  it("shows the title, date, sections and lists", () => {
    render(<LegalPage document={DOCUMENT} />);

    expect(screen.getByRole("heading", { level: 1, name: "Test policy" })).toBeInTheDocument();
    expect(screen.getByText("Last updated 1 January 2027")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Lists" })).toBeInTheDocument();
    const main = within(screen.getByRole("main"));
    expect(main.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "One",
      "Two, at hello@kestlow.co.uk",
    ]);
    expect(document.title).toBe("Test policy – Kestlow");
  });

  it("makes email and web addresses links, leaving full stops outside them", () => {
    render(<LegalPage document={DOCUMENT} />);

    expect(screen.getByRole("link", { name: "privacy@kestlow.co.uk" })).toHaveAttribute(
      "href",
      "mailto:privacy@kestlow.co.uk",
    );
    expect(screen.getByRole("link", { name: "https://ico.org.uk" })).toHaveAttribute(
      "href",
      "https://ico.org.uk",
    );
    expect(screen.getByRole("link", { name: "hello@kestlow.co.uk" })).toBeInTheDocument();
  });
});

describe("the legal documents", () => {
  it.each([
    ["privacy notice", PRIVACY],
    ["terms", TERMS],
    ["refund policy", REFUNDS],
  ])("the %s has no repeated headings, which would confuse screen readers", (_name, doc) => {
    const headings = doc.sections.map((section) => section.heading);
    expect(new Set(headings).size).toBe(headings.length);
  });

  it("says the ICO number is to follow until there is one", () => {
    expect(icoRegistration(null)).toMatch(/registration number will appear here/);
    expect(icoRegistration("ZB123456")).toBe(
      "We're registered with the Information Commissioner's Office (ICO), number ZB123456.",
    );
  });

  /** Every word of a document, to check what it promises. */
  const textOf = (doc: LegalDocument) =>
    [
      ...doc.intro,
      ...doc.sections.flatMap((section) =>
        section.blocks.flatMap((block) => (typeof block === "string" ? [block] : block.list)),
      ),
    ].join("\n");

  it("names who runs Kestlow and where, in the terms and the privacy notice", () => {
    for (const doc of [TERMS, PRIVACY]) {
      expect(textOf(doc)).toContain(
        `Barry Whiting, trading as Kestlow ("we", "us"), ${BUSINESS_ADDRESS}`,
      );
    }
  });

  it("sets out how paid plans will work (KES-122)", () => {
    const terms = textOf(TERMS);

    expect(terms).toContain("14 days of the Pro plan free, with no card needed");
    expect(terms).toContain("We're not registered for VAT");
    expect(terms).toContain("pause a paid plan for up to 3 months");
    expect(terms).toContain("Founding members: the first 100 customers");
    expect(terms).toContain("at least 7 days before a yearly plan renews");
    expect(terms).toContain("by card or Direct Debit");
    expect(terms).toContain("A downgrade starts when your next payment is due");
  });

  it("offers the free trial instead of a money-back guarantee, refunding only exceptions (KES-122)", () => {
    const refunds = textOf(REFUNDS);

    expect(REFUNDS.sections[0]).toMatchObject({ heading: "Try it free first" });
    expect(refunds).not.toMatch(/money-back/i);
    expect(refunds).toContain("we'll refund the mistaken charge in full");
    expect(textOf(TERMS)).toContain("There's one free trial per person");
    expect(textOf(TERMS)).toContain("once in any 12 months");
  });
});
