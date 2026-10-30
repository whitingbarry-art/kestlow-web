import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLeadsApi } from "../../api/LeadsApiContext";
import { CONTACT } from "../../data/contact";
import { PLANS } from "../../data/waitlist";
import { SUBSCRIPTION_KEY, useSubscription } from "../../hooks/useSubscription";
import { describePlan, formatBillingDate } from "../../logic/billing";
import type { BillingInterval, PaidPlan } from "../../types/billing";
import { PublicLayout } from "../site/PublicLayout";
import { Button } from "../ui/Button";
import { ErrorState } from "../ui/ErrorState";
import { LoadingState } from "../ui/LoadingState";
import { PlanCard } from "../waitlist/PlanCard";

/** The paid plans, as Checkout knows them, in the order they're shown. */
const PAID_PLANS: { plan: PaidPlan; name: string }[] = [
  { plan: "solo", name: "Solo" },
  { plan: "pro", name: "Pro" },
];

/** Statuses with a paid plan already, which is changed rather than bought again. */
const SUBSCRIBED = new Set(["active", "past_due", "paused"]);

interface PricingPageProps {
  /** Leaves for Stripe Checkout or the app; tests pass a spy. */
  goTo?: (url: string) => void;
}

/**
 * Plans and prices for someone signed in (KES-50): Solo or Pro, monthly or yearly, each with a
 * button to Stripe Checkout, and the free trial for anyone who hasn't had one (KES-49).
 */
export function PricingPage({ goTo = (url) => window.location.assign(url) }: PricingPageProps) {
  const api = useLeadsApi();
  const queryClient = useQueryClient();
  const subscription = useSubscription();
  const [payEvery, setPayEvery] = useState<BillingInterval>("month");
  const [message, setMessage] = useState<string | null>(null);

  const checkout = useMutation({
    mutationFn: (plan: PaidPlan) => api.checkout(plan, payEvery),
    onSuccess: (result) => (result.ok ? goTo(result.url) : setMessage(result.message)),
    onError: () => setMessage("We couldn't reach our payment provider. Please try again."),
  });
  const trial = useMutation({
    mutationFn: () => api.startTrial(),
    onSuccess: (started) => {
      if (started) queryClient.setQueryData(SUBSCRIPTION_KEY, started);
      if (started?.status === "trialing") goTo("/");
      else setMessage("We couldn't start your free trial. Please confirm your email first.");
    },
    onError: () => setMessage("We couldn't start your free trial. Please try again."),
  });

  if (subscription.isPending) return <LoadingState message="Getting your plan…" />;
  if (subscription.isError)
    return (
      <ErrorState
        message="We couldn't reach Kestlow. Check your connection and try again."
        onRetry={() => void subscription.refetch()}
      />
    );

  const current = subscription.data;
  const subscribed = current.status !== null && SUBSCRIBED.has(current.status);
  const busy = checkout.isPending || trial.isPending;

  return (
    <PublicLayout title="Plans and prices">
      <p className="mt-0 mb-2 text-lg leading-relaxed">
        Your plan: <b>{describePlan(current)}</b>.
      </p>
      {current.status === "trialing" && current.trialEndsAt && (
        <p className="mt-0 mb-0 text-muted">
          Choosing a plan now ends your free trial, and your plan starts straight away. Otherwise
          your account moves to the free plan on {formatBillingDate(current.trialEndsAt)}.
        </p>
      )}

      {current.trialAvailable && (
        <div className="mt-6 rounded-card border-2 border-amber bg-card p-4">
          <p className="m-0">
            <b>Not sure yet?</b> Try Pro free for 14 days, with no card needed. If you don't choose
            a plan, you move to the free plan and pay nothing.
          </p>
          <Button className="mt-3 w-full" disabled={busy} onClick={() => trial.mutate()}>
            {trial.isPending ? "Starting your trial…" : "Start my free trial"}
          </Button>
        </div>
      )}

      {subscribed ? (
        <p className="mt-6 mb-0 rounded-card bg-card p-4">
          To change or cancel your plan, email{" "}
          <a href={`mailto:${CONTACT.billing}`} className="font-semibold text-ink underline">
            {CONTACT.billing}
          </a>{" "}
          for now. Managing it here yourself is coming soon.
        </p>
      ) : (
        <>
          <h2 className="mt-8 mb-3 text-xl font-bold">Choose your plan</h2>
          <div
            role="group"
            aria-label="How often to pay"
            className="inline-flex rounded-xl bg-chip p-1"
          >
            {(["month", "year"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={payEvery === option}
                onClick={() => setPayEvery(option)}
                className={
                  payEvery === option
                    ? "min-h-11 rounded-lg bg-card px-4 font-bold text-ink shadow-card"
                    : "min-h-11 rounded-lg px-4 font-semibold text-muted"
                }
              >
                {option === "month" ? "Monthly" : "Yearly, 2 months free"}
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {PAID_PLANS.map(({ plan, name }) => (
              <PlanCard key={plan} plan={PLANS.find((p) => p.name === name)!} interval={payEvery}>
                <Button className="w-full" disabled={busy} onClick={() => checkout.mutate(plan)}>
                  {checkout.isPending && checkout.variables === plan
                    ? "Opening secure checkout…"
                    : `Choose ${name}`}
                </Button>
              </PlanCard>
            ))}
          </div>
        </>
      )}

      <p role="status" className="mt-4 mb-0 min-h-[1lh] font-semibold text-error">
        {message}
      </p>

      <ul className="mt-6 mb-0 flex flex-col gap-2 pl-5 text-muted">
        <li>
          Founding members: the first 100 paying customers keep their launch price for as long as
          they stay subscribed.
        </li>
        <li>Pay by card or Direct Debit, through Stripe. No contract: cancel any time.</li>
        <li>No VAT is added: we're not registered for VAT.</li>
        <li>
          See our{" "}
          <a href="/terms" className="text-ink underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="/refunds" className="text-ink underline">
            Refund policy
          </a>
          .
        </li>
      </ul>
    </PublicLayout>
  );
}
