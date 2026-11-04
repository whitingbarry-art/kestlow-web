import { render, screen, waitFor } from "@testing-library/react";
import type { CouncilPreview } from "../../api/councilPreview";
import { areaPageFor } from "../../data/areas";
import { SAMPLE_LEADS } from "../../data/leads";
import { AreaPage } from "./AreaPage";

const PREVIEW: CouncilPreview = {
  council: "Bromley",
  days: 30,
  total: 103,
  byTrade: { Roofing: 56, Electrical: 95, Landscaping: 9, Groundworks: 35 },
  examples: {
    Roofing: [{ ...SAMPLE_LEADS[0], description: "Loft conversion with rear dormer" }],
    Electrical: [],
    Landscaping: [],
    Groundworks: [],
  },
};

const roofingInBromley = areaPageFor("/roofing-leads/bromley")!;

describe("AreaPage", () => {
  it("shows the council's numbers for the trade and examples as the free plan shows them", async () => {
    const load = vi.fn(() => Promise.resolve(PREVIEW));
    render(<AreaPage {...roofingInBromley} load={load} recordStep={vi.fn()} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Roofing leads in Bromley" }),
    ).toBeVisible();
    expect(
      await screen.findByText(/planning applications in Bromley could need a roofer/),
    ).toHaveTextContent(
      "In the last 30 days, 56 planning applications in Bromley could need a roofer.",
    );
    expect(screen.getByText("Loft conversion with rear dormer")).toBeVisible();
    // Distances are from Bromley town centre, which means nothing on another town's page.
    expect(screen.queryByText(/\bmiles?\b/)).toBeNull();
    expect(load).toHaveBeenCalledWith("Bromley");
    expect(document.title).toBe("Roofing leads in Bromley – Kestlow");
  });

  it("leaves the numbers out if the API can't give them", async () => {
    const load = () => Promise.reject(new Error("offline"));
    render(<AreaPage {...roofingInBromley} load={load} recordStep={vi.fn()} />);

    await waitFor(() =>
      expect(screen.queryByRole("heading", { name: /work in Bromley last month/ })).toBeNull(),
    );
    expect(screen.getByRole("link", { name: "Start your free 14-day trial" })).toBeVisible();
  });

  it("counts the visit and the trial tap under the page's own ref", async () => {
    const recordStep = vi.fn();
    render(
      <AreaPage
        {...roofingInBromley}
        load={() => Promise.resolve(PREVIEW)}
        recordStep={recordStep}
      />,
    );

    const trial = screen.getByRole("link", { name: "Start your free 14-day trial" });
    expect(trial).toHaveAttribute("href", "/?start=trial&ref=seo-roofing-bromley");
    trial.click();
    expect(recordStep.mock.calls).toEqual([
      ["launch_viewed", { source: "seo-roofing-bromley" }],
      ["trial_tapped", { source: "seo-roofing-bromley" }],
    ]);
    await screen.findByText(/could need a roofer\.$/);
  });

  it("offers the trade's free weekly leads by email, with the trade chosen (KES-137)", () => {
    render(
      <AreaPage
        {...roofingInBromley}
        load={() => new Promise(() => {})}
        recordStep={vi.fn()}
        leadEmailsApi={{ request: vi.fn() }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Get this week's roofing leads free" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Your trade")).toHaveValue("Roofing");
  });

  it("links to the other trades in the council and the same trade elsewhere", () => {
    render(
      <AreaPage {...roofingInBromley} load={() => Promise.resolve(PREVIEW)} recordStep={vi.fn()} />,
    );

    expect(screen.getByRole("link", { name: "Electrical leads in Bromley" })).toHaveAttribute(
      "href",
      "/electrical-leads/bromley",
    );
    expect(screen.getByRole("link", { name: "Sevenoaks" })).toHaveAttribute(
      "href",
      "/roofing-leads/sevenoaks",
    );
    expect(screen.queryByRole("link", { name: "Roofing leads in Bromley" })).toBeNull();
  });
});
