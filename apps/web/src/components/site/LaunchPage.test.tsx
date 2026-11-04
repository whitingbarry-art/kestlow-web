import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { LeadsPreview } from "../../api/preview";
import { SAMPLE_LEADS } from "../../data/leads";
import { LaunchPage } from "./LaunchPage";

const PREVIEW: LeadsPreview = {
  radiusMiles: 15,
  days: 30,
  total: 305,
  byTrade: { Roofing: 133, Electrical: 277, Landscaping: 33, Groundworks: 102 },
  examples: [{ ...SAMPLE_LEADS[1], address: "Orpington, BR5", masked: true }],
};
// Every render gets a preview, so no test reaches for the network.
const loadPreview = () => Promise.resolve(PREVIEW);

describe("LaunchPage", () => {
  it("lets people who already have an account sign in", () => {
    render(<LaunchPage loadPreview={loadPreview} />);

    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/?signin");
  });

  it("starts the free trial, carrying the card or ad's code to the new account (KES-125)", () => {
    render(<LaunchPage source="screwfix-bromley" loadPreview={loadPreview} />);

    const starts = screen.getAllByRole("link", { name: "Start your free 14-day trial" });
    expect(starts).toHaveLength(2);
    for (const start of starts)
      expect(start).toHaveAttribute("href", "/?start=trial&ref=screwfix-bromley");
    expect(screen.queryByText(/waitlist/i)).not.toBeInTheDocument();
  });

  it("leads with free weekly leads by email, carrying the ad's code (KES-137)", async () => {
    const user = userEvent.setup();
    const request = vi.fn(() => Promise.resolve({ ok: true as const, status: "sent" as const }));
    render(<LaunchPage source="ad-first" loadPreview={loadPreview} leadEmailsApi={{ request }} />);

    expect(screen.getByRole("link", { name: "Get this week's leads free" })).toHaveAttribute(
      "href",
      "#free-leads",
    );
    const section = screen.getByRole("region", { name: "Get this week's leads near you, free" });
    expect(section).toHaveAttribute("id", "free-leads");

    await user.selectOptions(screen.getByLabelText("Your trade"), "Roofing");
    await user.type(screen.getByLabelText("Your postcode"), "BR1");
    await user.type(screen.getByLabelText("Your email"), "dave@example.com");
    await user.click(screen.getByRole("button", { name: "Send me this week's leads" }));

    expect(request).toHaveBeenCalledWith(expect.objectContaining({ source: "ad-first" }));
  });

  it("shows today's prices, and promises only what Kestlow does now", () => {
    render(<LaunchPage loadPreview={loadPreview} />);

    expect(screen.getByRole("heading", { name: "Plans and prices" })).toBeInTheDocument();
    expect(screen.getByText("£29")).toBeInTheDocument();
    expect(screen.getByText("Cancel any time")).toBeInTheDocument();
    expect(screen.queryByText(/two clicks/)).not.toBeInTheDocument();
  });

  it("has the site's footer, without naming who runs Kestlow (KES-124)", () => {
    render(<LaunchPage loadPreview={loadPreview} />);

    expect(screen.getByRole("contentinfo")).toHaveTextContent("© ");
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    expect(screen.queryByText(/Barry Whiting/)).not.toBeInTheDocument();
  });

  it("counts the visit and a tap on the trial, with the card or ad's code (KES-130)", async () => {
    const recordStep = vi.fn();
    render(<LaunchPage source="ad-numbers" recordStep={recordStep} loadPreview={loadPreview} />);
    expect(recordStep).toHaveBeenCalledWith("launch_viewed", { source: "ad-numbers" });

    const start = screen.getAllByRole("link", { name: "Start your free 14-day trial" })[0];
    // jsdom doesn't navigate; the tap is what's counted.
    start.addEventListener("click", (event) => event.preventDefault());
    await userEvent.click(start);

    expect(recordStep).toHaveBeenCalledWith("trial_tapped", { source: "ad-numbers" });
  });

  it("shows real numbers and recent leads near Bromley, before anyone signs up (KES-131)", async () => {
    render(<LaunchPage loadPreview={loadPreview} />);

    const live = await screen.findByRole("region", { name: "Real work near Bromley" });
    expect(live).toHaveTextContent(
      "In the last 30 days, 305 planning applications within 15 miles of Bromley involved roofing",
    );
    expect(live).toHaveTextContent("133 roofing");
    expect(live).toHaveTextContent("Orpington, BR5");
  });

  it("leaves the live section out if the numbers can't be loaded", async () => {
    render(<LaunchPage loadPreview={() => Promise.reject(new Error("offline"))} />);

    await vi.waitFor(() =>
      expect(
        screen.queryByRole("region", { name: "Real work near Bromley" }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("heading", { name: "Why tradespeople use Kestlow" })).toBeVisible();
  });

  it("compares the plans as Kestlow applies them, and answers questions honestly", () => {
    render(<LaunchPage loadPreview={loadPreview} />);

    const table = screen.getByRole("table", { name: "Free, Solo and Pro compared" });
    expect(table).toHaveTextContent("A week late");
    expect(table).toHaveTextContent("Up to 50 miles");
    expect(screen.getByText("Does a lead mean I'll get the job?")).toBeInTheDocument();
    // Never a homeowner's name (KES-131).
    expect(screen.getByText("Why can't I see the homeowner's name?")).toBeInTheDocument();
    // What Free holds back is on its card, which phones see when the table is left out.
    expect(
      screen.getByText("The area only: no address, council link or applicant's name"),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(
        "Full details: the address, council link and, if a company applied, its name",
      ),
    ).toHaveLength(2);
    // The phone picture uses made-up sample leads, and says so.
    expect(screen.getByText("Kestlow on a phone, with example leads")).toBeInTheDocument();
  });

  it("starts the trial from an example lead, with the ad's code (KES-131)", async () => {
    const recordStep = vi.fn();
    render(<LaunchPage source="ad-numbers" recordStep={recordStep} loadPreview={loadPreview} />);

    const example = await screen.findByRole("link", {
      name: /Start your free trial to see it in full/,
    });
    expect(example).toHaveAttribute("href", "/?start=trial&ref=ad-numbers");
    example.addEventListener("click", (event) => event.preventDefault());
    await userEvent.click(example);
    expect(recordStep).toHaveBeenCalledWith("trial_tapped", { source: "ad-numbers" });
    // Examples are only examples: nothing to view or save.
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
  });
});
