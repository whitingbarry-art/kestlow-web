import { createSampleLeadsApi, FREE_PLAN } from "../../api/sampleLeadsApi";
import { SAMPLE_LEADS } from "../../data/leads";
import type { SubscriptionSummary } from "../../types/billing";

/** A sample API on a given plan, for the billing stories. Dates are a few days from now. */
export const apiOnPlan = (fields: Partial<SubscriptionSummary>) =>
  createSampleLeadsApi(SAMPLE_LEADS, 20, [], "BR1 1AA", { ...FREE_PLAN, ...fields });

const inDays = (days: number) => new Date(Date.now() + days * 864e5).toISOString();

export const TRIALING: Partial<SubscriptionSummary> = {
  plan: "pro",
  status: "trialing",
  interval: "month",
  trialEndsAt: inDays(9),
  currentPeriodEnd: inDays(9),
  trialAvailable: false,
};

export const PAYING: Partial<SubscriptionSummary> = {
  plan: "pro",
  status: "active",
  interval: "month",
  currentPeriodEnd: inDays(20),
  foundingMember: true,
  trialAvailable: false,
};
