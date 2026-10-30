import { render, screen } from "@testing-library/react";
import { createSampleLeadsApi, FREE_PLAN } from "../../api/sampleLeadsApi";
import { SAMPLE_LEADS } from "../../data/leads";
import { providers } from "../../test/providers";
import { TrialBanner } from "./TrialBanner";

describe("TrialBanner", () => {
  it("counts down the trial, with the way to a plan", async () => {
    const trialEndsAt = new Date(Date.now() + 9 * 864e5 - 60_000).toISOString();
    const api = createSampleLeadsApi(SAMPLE_LEADS, 20, [], null, {
      ...FREE_PLAN,
      plan: "pro",
      status: "trialing",
      trialEndsAt,
      trialAvailable: false,
    });
    render(<TrialBanner />, { wrapper: providers(api) });

    expect(await screen.findByText("Free Pro trial: 9 days left.")).toBeVisible();
    expect(screen.getByRole("link", { name: "Choose a plan" })).toHaveAttribute("href", "/pricing");
  });

  it("isn't shown outside a trial", async () => {
    const api = createSampleLeadsApi();
    const getSubscription = vi.spyOn(api, "getSubscription");
    render(<TrialBanner />, { wrapper: providers(api) });

    await vi.waitFor(() => expect(getSubscription).toHaveBeenCalled());
    expect(screen.queryByText(/Free Pro trial/)).not.toBeInTheDocument();
  });
});
