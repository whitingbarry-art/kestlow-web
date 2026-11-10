import { render, screen } from "@testing-library/react";
import { AccessibilityPage } from "./AccessibilityPage";

describe("AccessibilityPage", () => {
  it("says what we aim for, how we check, what doesn't work yet and how to tell us", () => {
    render(<AccessibilityPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Accessibility" })).toBeInTheDocument();
    expect(screen.getByText("Last updated 3 November 2026.")).toBeInTheDocument();
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent),
    ).toEqual([
      "What we aim for",
      "What you should be able to do",
      "How we check",
      "What doesn't work well yet",
      "Tell us about a problem",
    ]);
    expect(screen.getByRole("link", { name: "support@kestlow.co.uk" })).toHaveAttribute(
      "href",
      "mailto:support@kestlow.co.uk",
    );
    expect(screen.getByRole("link", { name: "contact form" })).toHaveAttribute("href", "/contact");
    expect(document.title).toBe("Accessibility – Kestlow™");
  });

  it("never claims more than we can show (KES-132)", () => {
    render(<AccessibilityPage />);

    const text = screen.getByRole("main").textContent ?? "";
    expect(text).toContain("we don't claim to meet them in full");
    expect(text).not.toMatch(/fully accessible|certified|compliant/i);
  });
});
