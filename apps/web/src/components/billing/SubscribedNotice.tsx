import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLeadsApi } from "../../api/LeadsApiContext";
import { subscriptionQuery } from "../../hooks/useSubscription";

const PLAN_NAMES: Record<string, string> = { solo: "Solo", pro: "Pro" };

/** How often to look while Stripe tells Kestlow about the payment, and for how long. */
const CHECK_EVERY_MS = 2000;
const GIVE_UP_AFTER = 15;

/**
 * Thanks someone back from Stripe Checkout (KES-50), on the address Checkout returns to,
 * `/?subscribed=pro`. Stripe tells Kestlow about the payment separately, a moment later, so it
 * checks until the plan shows before saying it's on.
 */
export function SubscribedNotice() {
  const [chosen, setChosen] = useState(() =>
    new URLSearchParams(window.location.search).get("subscribed"),
  );
  const subscription = useQuery({
    ...subscriptionQuery(useLeadsApi()),
    refetchInterval: (query) =>
      chosen && query.state.data?.plan !== chosen && query.state.dataUpdateCount < GIVE_UP_AFTER
        ? CHECK_EVERY_MS
        : false,
  });
  const name = chosen && PLAN_NAMES[chosen];
  if (!name) return null;

  const dismiss = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("subscribed");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    setChosen(null);
  };
  const on = subscription.data?.plan === chosen;

  return (
    <div className="mx-4 mt-3 rounded-card border-2 border-match-text bg-card p-3.5 text-[15px] desk:mx-6">
      <p role="status" className="m-0">
        {on ? (
          <>
            <b>Thank you! You're on {name}.</b> Your leads now come as soon as they're published.
          </>
        ) : (
          <>
            <b>Thank you!</b> We're switching your {name} plan on. This takes a few seconds.
          </>
        )}
      </p>
      <button type="button" onClick={dismiss} className="min-h-11 font-semibold text-ink underline">
        Close
      </button>
    </div>
  );
}
