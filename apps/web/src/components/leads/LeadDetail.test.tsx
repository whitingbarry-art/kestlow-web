import { render, screen } from "@testing-library/react";
import { maskedLead, sampleLead } from "../../stories/fixtures";
import { LeadDetail } from "./LeadDetail";

describe("LeadDetail", () => {
  it("links to the council's page and shows who applied, on a paid plan", () => {
    render(<LeadDetail lead={sampleLead} saved={false} onToggleSave={vi.fn()} />);

    expect(screen.getByRole("link", { name: /Open council page/ })).toHaveAttribute(
      "href",
      sampleLead.sourceUrl,
    );
  });

  it("shows the free plan the area, and the way to the address instead of the council's page", () => {
    render(<LeadDetail lead={maskedLead} saved={false} onToggleSave={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Chislehurst, BR7" })).toBeVisible();
    expect(screen.queryByRole("link", { name: /Open council page/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See the address" })).toHaveAttribute(
      "href",
      "/pricing",
    );
    expect(screen.getByText(/you see the area, not the exact address/)).toBeVisible();
    // The reference and the applicant.
    expect(screen.getAllByText("With Solo or Pro")).toHaveLength(2);
  });
});
