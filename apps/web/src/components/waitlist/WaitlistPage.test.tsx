import { render, screen } from "@testing-library/react";
import type { JoinWaitlist } from "../../api/waitlist";
import { WaitlistPage } from "./WaitlistPage";

describe("WaitlistPage", () => {
  it("lets people who already have an account sign in", () => {
    render(<WaitlistPage join={vi.fn<JoinWaitlist>()} />);

    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/");
  });

  it("says who collects the details and how to have them deleted", () => {
    render(<WaitlistPage join={vi.fn<JoinWaitlist>()} />);

    expect(screen.getByText(/Kestlow is run by Barry Whiting\./)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "whiting.barry@googlemail.com" })).toHaveAttribute(
      "href",
      "mailto:whiting.barry@googlemail.com",
    );
  });
});
