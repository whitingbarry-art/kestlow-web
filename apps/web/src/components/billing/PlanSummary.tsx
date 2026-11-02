import { useSubscription } from "../../hooks/useSubscription";
import { canManagePlan, describePlan } from "../../logic/billing";
import { buttonClassName } from "../ui/buttonStyles";
import { ManagePlanButton } from "./ManagePlanButton";

/** The plan someone's on, with the way to the plans (KES-50), for the Account page. */
export function PlanSummary() {
  const subscription = useSubscription();
  const current = subscription.data;

  return (
    <div className="py-3.5">
      <p className="m-0">
        {current ? (
          <>
            <b>{describePlan(current)}</b>
            {current.foundingMember && ". You're a founding member, so your price stays the same."}
          </>
        ) : subscription.isError ? (
          "We couldn't load your plan just now."
        ) : (
          "Getting your plan…"
        )}
      </p>
      {/* Paying customers manage their plan in Stripe's Customer Portal (KES-51). */}
      {canManagePlan(current) && <ManagePlanButton className="mt-3" />}
      <a href="/pricing" className={buttonClassName("ghost", "mt-3 block w-full no-underline")}>
        {current?.plan === "free" ? "See plans and prices" : "Plans and prices"}
      </a>
    </div>
  );
}
