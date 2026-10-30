import type { SubscriptionSummary } from "../types/billing";

const PLAN_NAMES = { free: "Free", solo: "Solo", pro: "Pro" } as const;

const day = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  timeZone: "Europe/London",
});

/** "13 November": how dates read in billing messages. */
export function formatBillingDate(iso: string): string {
  return day.format(new Date(iso));
}

/**
 * Whole days left of a free trial (KES-49), counting part of a day as a day, so the last day says
 * 1 rather than 0; null when they aren't on a trial.
 */
export function trialDaysLeft(subscription: SubscriptionSummary, now = new Date()): number | null {
  if (subscription.status !== "trialing" || !subscription.trialEndsAt) return null;
  const left = Math.ceil((Date.parse(subscription.trialEndsAt) - now.getTime()) / 864e5);
  return Math.max(left, 0);
}

/** The plan's name and where it stands, as the Account page shows it (KES-50). */
export function describePlan(subscription: SubscriptionSummary): string {
  const name = PLAN_NAMES[subscription.plan];
  const { status, trialEndsAt, currentPeriodEnd, cancelAtPeriodEnd } = subscription;
  if (status === "trialing" && trialEndsAt)
    return `Free ${name} trial, until ${formatBillingDate(trialEndsAt)}`;
  if (status === "paused") return "Paused: the Free plan until it restarts";
  if (status === "past_due") return `${name}: payment overdue`;
  if (status === "active" && currentPeriodEnd)
    return cancelAtPeriodEnd
      ? `${name}, ending ${formatBillingDate(currentPeriodEnd)}`
      : `${name}, renews ${formatBillingDate(currentPeriodEnd)}`;
  return name;
}
