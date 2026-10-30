/** The paid plans (KES-50); "free" means no paid plan's features are on. */
export type PaidPlan = "solo" | "pro";
export type BillingInterval = "month" | "year";

/** Where a Stripe subscription stands, as the API reports it (KES-48). */
export type SubscriptionStatus =
  "trialing" | "active" | "past_due" | "paused" | "unpaid" | "incomplete" | "canceled";

/** Someone's plan, from GET /me/subscription. Dates are ISO timestamps. */
export interface SubscriptionSummary {
  /** The plan whose features are on: "free" without a subscription, or once one has ended. */
  plan: PaidPlan | "free";
  status: SubscriptionStatus | null;
  interval: BillingInterval | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  paymentFailedAt: string | null;
  foundingMember: boolean;
  /** Whether they can still start the free trial: never had one, and no subscription now. */
  trialAvailable: boolean;
}
