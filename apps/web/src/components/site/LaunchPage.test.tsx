import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LaunchPage } from "./LaunchPage";

describe("LaunchPage", () => {
  it("lets people who already have an account sign in", () => {
    render(<LaunchPage />);

    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/");
  });

  it("starts the free trial, carrying the card or ad's code to the new account (KES-125)", () => {
    render(<LaunchPage source="screwfix-bromley" />);

    const starts = screen.getAllByRole("link", { name: "Start your free 14-day trial" });
    expect(starts).toHaveLength(2);
    for (const start of starts)
      expect(start).toHaveAttribute("href", "/?start=trial&ref=screwfix-bromley");
    expect(screen.queryByText(/waitlist/i)).not.toBeInTheDocument();
  });

  it("shows today's prices, and promises only what Kestlow does now", () => {
    render(<LaunchPage />);

    expect(screen.getByRole("heading", { name: "Plans and prices" })).toBeInTheDocument();
    expect(screen.getByText("£29")).toBeInTheDocument();
    expect(screen.getByText("Cancel any time")).toBeInTheDocument();
    expect(screen.queryByText(/two clicks/)).not.toBeInTheDocument();
  });

  it("has the site's footer, without naming who runs Kestlow (KES-124)", () => {
    render(<LaunchPage />);

    expect(screen.getByRole("contentinfo")).toHaveTextContent("© ");
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    expect(screen.queryByText(/Barry Whiting/)).not.toBeInTheDocument();
  });

  it("counts the visit and a tap on the trial, with the card or ad's code (KES-130)", async () => {
    const recordStep = vi.fn();
    render(<LaunchPage source="ad-numbers" recordStep={recordStep} />);
    expect(recordStep).toHaveBeenCalledWith("launch_viewed", { source: "ad-numbers" });

    const start = screen.getAllByRole("link", { name: "Start your free 14-day trial" })[0];
    // jsdom doesn't navigate; the tap is what's counted.
    start.addEventListener("click", (event) => event.preventDefault());
    await userEvent.click(start);

    expect(recordStep).toHaveBeenCalledWith("trial_tapped", { source: "ad-numbers" });
  });
});
