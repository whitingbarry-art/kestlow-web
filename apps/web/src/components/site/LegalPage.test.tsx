import { render, screen, within } from "@testing-library/react";
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

  it("promises the 30-day guarantee the ticket asks for", () => {
    expect(REFUNDS.sections[0]).toMatchObject({ heading: "30-day money-back guarantee" });
  });
});
