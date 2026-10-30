import { render, screen } from "@testing-library/react";
import type { JoinWaitlist } from "../../api/waitlist";
import { WaitlistPage } from "./WaitlistPage";

describe("WaitlistPage", () => {
  it("lets people who already have an account sign in", () => {
    render(<WaitlistPage join={vi.fn<JoinWaitlist>()} />);

    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/");
  });

  it("shows the prices as planned for launch, with nothing to pay now", () => {
    render(<WaitlistPage join={vi.fn<JoinWaitlist>()} />);

    expect(screen.getByRole("heading", { name: "Planned prices at launch" })).toBeInTheDocument();
    expect(screen.getByText(/Nothing to pay now/)).toHaveTextContent(
      "Prices may change before we launch.",
    );
  });

  it("says who collects the details and how to have them deleted", () => {
    render(<WaitlistPage join={vi.fn<JoinWaitlist>()} />);

    expect(screen.getByText(/Kestlow is run by Barry Whiting\./)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "privacy@kestlow.co.uk" })).toHaveAttribute(
      "href",
      "mailto:privacy@kestlow.co.uk",
    );
  });
});
