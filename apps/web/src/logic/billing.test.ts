import { FREE_PLAN } from "../api/sampleLeadsApi";
import type { SubscriptionSummary } from "../types/billing";
import { describePlan, trialDaysLeft } from "./billing";

const NOW = new Date("2026-10-30T12:00:00Z");
const trial: SubscriptionSummary = {
  ...FREE_PLAN,
  plan: "pro",
  status: "trialing",
  interval: "month",
  trialEndsAt: "2026-11-13T12:00:00Z",
  currentPeriodEnd: "2026-11-13T12:00:00Z",
  trialAvailable: false,
};

describe("trialDaysLeft", () => {
  it("counts the days left, a part day as a day", () => {
    expect(trialDaysLeft(trial, NOW)).toBe(14);
    expect(trialDaysLeft(trial, new Date("2026-11-13T09:00:00Z"))).toBe(1);
    expect(trialDaysLeft(trial, new Date("2026-11-14T09:00:00Z"))).toBe(0);
  });

  it("is null when they aren't on a trial", () => {
    expect(trialDaysLeft(FREE_PLAN, NOW)).toBeNull();
    expect(trialDaysLeft({ ...trial, status: "active" }, NOW)).toBeNull();
  });
});

describe("describePlan", () => {
  const paid: SubscriptionSummary = {
    ...trial,
    status: "active",
    trialEndsAt: null,
    currentPeriodEnd: "2026-11-30T12:00:00Z",
  };

  it("says what plan they're on and what happens next", () => {
    expect(describePlan(FREE_PLAN)).toBe("Free");
    expect(describePlan(trial)).toBe("Free Pro trial, until 13 November");
    expect(describePlan(paid)).toBe("Pro, renews 30 November");
    expect(describePlan({ ...paid, cancelAtPeriodEnd: true })).toBe("Pro, ending 30 November");
    expect(describePlan({ ...paid, status: "past_due" })).toBe("Pro: payment overdue");
    expect(describePlan({ ...paid, plan: "free", status: "paused" })).toBe(
      "Paused: the Free plan until it restarts",
    );
  });
});
