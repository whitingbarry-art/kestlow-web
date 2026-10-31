import { render, screen } from "@testing-library/react";
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
});
