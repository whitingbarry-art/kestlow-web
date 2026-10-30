import { useSubscription } from "../../hooks/useSubscription";
import { trialDaysLeft } from "../../logic/billing";
import { buttonClassName } from "../ui/buttonStyles";

/**
 * Days left of the free Pro trial (KES-49), with the way to keep Pro: shown only during a trial.
 */
export function TrialBanner() {
  const subscription = useSubscription().data;
  const days = subscription && trialDaysLeft(subscription);
  if (days === null || days === undefined) return null;

  return (
    <div className="mx-4 mt-3 flex flex-wrap items-center gap-3 rounded-card border-2 border-amber bg-card p-3.5 text-[15px] desk:mx-6">
      <p className="m-0 flex-1 basis-60">
        <b>
          Free Pro trial:{" "}
          {days === 0 ? "ends today" : `${days} ${days === 1 ? "day" : "days"} left`}.
        </b>{" "}
        Choose a plan to keep your leads coming as soon as they're published.
      </p>
      <a href="/pricing" className={buttonClassName("primary", "flex-none px-5 no-underline")}>
        Choose a plan
      </a>
    </div>
  );
}
