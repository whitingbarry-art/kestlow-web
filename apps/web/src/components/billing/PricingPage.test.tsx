import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { LoadFounding } from "../../api/founding";
import type { LeadsApi } from "../../api/leads";
import { createSampleLeadsApi, FREE_PLAN } from "../../api/sampleLeadsApi";
import { SAMPLE_LEADS } from "../../data/leads";
import { providers } from "../../test/providers";
import type { SubscriptionSummary } from "../../types/billing";
import { PricingPage } from "./PricingPage";

const withPlan = (subscription: SubscriptionSummary) =>
  createSampleLeadsApi(SAMPLE_LEADS, 20, [], "BR1 1AA", subscription);

const noOffer: LoadFounding = () => Promise.resolve(null);

const renderPricing = (api: LeadsApi, goTo = vi.fn(), loadFounding = noOffer) => {
  render(<PricingPage goTo={goTo} loadFounding={loadFounding} />, { wrapper: providers(api) });
  return goTo;
};

describe("PricingPage", () => {
  it("sends someone to Stripe Checkout for the plan and payment they chose", async () => {
    const user = userEvent.setup();
    const api = withPlan({ ...FREE_PLAN, trialAvailable: false });
    const checkout = vi.spyOn(api, "checkout");
    const goTo = renderPricing(api);

    await user.click(await screen.findByRole("button", { name: "Yearly, 2 months free" }));
    expect(screen.getByText("£490")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Choose Pro" }));

    expect(checkout).toHaveBeenCalledWith("pro", "year");
    expect(goTo).toHaveBeenCalledWith("https://checkout.stripe.com/c/pay/sample");
  });

  it("says how many first-20 places are left at the Solo price, only while there are some", async () => {
    const offer = { placesLeft: 3, places: 20, monthlyPence: 1900, fullPence: 2900 };
    renderPricing(withPlan({ ...FREE_PLAN, trialAvailable: false }), vi.fn(), () =>
      Promise.resolve(offer),
    );

    expect(
      await screen.findByText(
        "First 20 customers: Solo Monthly for £19 a month instead of £29, for as long as you stay on it. 3 of 20 places left. Choose Solo, Monthly and it's taken off at checkout.",
      ),
    ).toBeVisible();
  });

  it("says nothing about first-20 places when there's no offer", async () => {
    renderPricing(withPlan({ ...FREE_PLAN, trialAvailable: false }));

    await screen.findByRole("button", { name: "Choose Solo" });
    expect(screen.queryByText(/First 20 customers/)).toBeNull();
  });

  it("offers the free trial to someone who hasn't had one, then goes to their leads", async () => {
    const user = userEvent.setup();
    const goTo = renderPricing(withPlan(FREE_PLAN));

    await user.click(await screen.findByRole("button", { name: "Start my free trial" }));

    expect(goTo).toHaveBeenCalledWith("/");
  });

  it("says when a trial ends, and that choosing a plan ends it", async () => {
    renderPricing(
      withPlan({
        ...FREE_PLAN,
        plan: "pro",
        status: "trialing",
        trialEndsAt: "2026-11-13T12:00:00Z",
        trialAvailable: false,
      }),
    );

    expect(await screen.findByText("Free Pro trial, until 13 November")).toBeVisible();
    expect(screen.getByText(/moves to the free plan on 13 November/)).toBeVisible();
    expect(screen.queryByRole("button", { name: "Start my free trial" })).not.toBeInTheDocument();
  });

  it("offers an admin no plan, trial or Customer Portal: there's nothing to pay (KES-164)", async () => {
    renderPricing(withPlan({ ...FREE_PLAN, plan: "pro", trialAvailable: false, admin: true }));

    expect(await screen.findByText("Pro (admin account)")).toBeVisible();
    expect(screen.getByText(/every Pro feature with nothing to pay/)).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /Choose|free trial|Manage/ }),
    ).not.toBeInTheDocument();
  });

  it("doesn't sell a plan to someone already paying, but opens the Customer Portal (KES-51)", async () => {
    const user = userEvent.setup();
    const goTo = renderPricing(
      withPlan({
        ...FREE_PLAN,
        plan: "solo",
        status: "active",
        currentPeriodEnd: "2026-11-30T12:00:00Z",
        trialAvailable: false,
      }),
    );

    expect(await screen.findByText("Solo, renews 30 November")).toBeVisible();
    expect(screen.queryByRole("button", { name: /Choose/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Manage my plan" }));
    expect(goTo).toHaveBeenCalledWith("https://billing.stripe.com/p/session/sample");
  });

  it("shows Checkout's message when it can't go ahead", async () => {
    const user = userEvent.setup();
    const api: LeadsApi = {
      ...withPlan({ ...FREE_PLAN, trialAvailable: false }),
      checkout: () => Promise.resolve({ ok: false, message: "Payments aren't set up here." }),
    };
    const goTo = renderPricing(api);

    await user.click(await screen.findByRole("button", { name: "Choose Solo" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Payments aren't set up here.");
    expect(goTo).not.toHaveBeenCalled();
  });
});
