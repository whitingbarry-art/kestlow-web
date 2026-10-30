import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createSampleLeadsApi, FREE_PLAN } from "../../api/sampleLeadsApi";
import { SAMPLE_LEADS } from "../../data/leads";
import { providers } from "../../test/providers";
import { SubscribedNotice } from "./SubscribedNotice";

describe("SubscribedNotice", () => {
  afterEach(() => window.history.replaceState(null, "", "/"));

  it("thanks someone back from Checkout once their plan is on, and goes when closed", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/?subscribed=pro");
    const api = createSampleLeadsApi(SAMPLE_LEADS, 20, [], null, {
      ...FREE_PLAN,
      plan: "pro",
      status: "active",
    });
    render(<SubscribedNotice />, { wrapper: providers(api) });

    expect(await screen.findByText("Thank you! You're on Pro.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByText(/Thank you/)).not.toBeInTheDocument();
    expect(window.location.search).toBe("");
  });

  it("says the plan is being switched on until Stripe has told Kestlow", async () => {
    window.history.replaceState(null, "", "/?subscribed=solo");
    render(<SubscribedNotice />, { wrapper: providers(createSampleLeadsApi()) });

    expect(await screen.findByText(/We're switching your Solo plan on/)).toBeVisible();
  });

  it("isn't shown on any other visit", () => {
    render(<SubscribedNotice />, { wrapper: providers(createSampleLeadsApi()) });

    expect(screen.queryByText(/Thank you/)).not.toBeInTheDocument();
  });
});
