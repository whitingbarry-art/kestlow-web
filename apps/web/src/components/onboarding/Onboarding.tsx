import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { TRADES } from "../../data/leads";
import { useAlertSettings } from "../../hooks/useAlertSettings";
import { useSignOut } from "../../hooks/useSession";
import { useSubscription } from "../../hooks/useSubscription";
import { formatDistance } from "../../logic/alerts";
import type { Trade } from "../../types/lead";
import { AreaMap } from "../alerts/AreaMap";
import { DistanceSlider } from "../alerts/DistanceSlider";
import { BrandLogo } from "../ui/BrandLogo";
import { Button } from "../ui/Button";
import { inputClassName } from "../ui/inputStyles";

interface OnboardingProps {
  /** Called once all three answers are saved, to show the leads. */
  onDone: () => void;
}

type Step = 1 | 2 | 3;

const TITLES: Record<Step, string> = {
  1: "Where are you based?",
  2: "Which trades do you do?",
  3: "How far will you travel?",
};

/**
 * Straight after signing up, three questions so the first leads are the person's own (KES-44):
 * base postcode, trades and distance, each saved through PUT /me/alert-settings. There's no
 * skip; Back goes to the previous question and Sign out leaves.
 */
export function Onboarding({ onDone }: OnboardingProps) {
  const settings = useAlertSettings();
  const signOut = useSignOut();
  const id = useId();
  const [step, setStep] = useState<Step>(1);
  const [postcode, setPostcode] = useState(settings.basePostcode ?? "");
  // In the order ticked: the first is their main trade (KES-52).
  const [trades, setTrades] = useState<Trade[]>(settings.chosenTrades);
  const [miles, setMiles] = useState(settings.distance);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    document.title = `${TITLES[step]} – Kestlow`;
    // After moving between steps, start screen readers and keyboards at the new question.
    if (moved.current) heading.current?.focus();
  }, [step]);

  function goTo(next: Step) {
    moved.current = true;
    setError(null);
    setStep(next);
  }

  async function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 1 && !postcode.trim()) return setError("Enter your postcode.");
    if (step === 2 && trades.length === 0) return setError("Choose at least one trade.");

    setSending(true);
    setError(null);
    const result = await settings.saveChanges(
      step === 1 ? { postcode } : step === 2 ? { trades } : { radiusMiles: miles },
    );
    setSending(false);
    if (!result.ok) return setError(result.message);
    if (step === 1) setPostcode(result.settings.postcode ?? postcode);
    if (step < 3) goTo((step + 1) as Step);
    else onDone();
  }

  const toggleTrade = (trade: Trade) =>
    setTrades((chosen) =>
      chosen.includes(trade) ? chosen.filter((t) => t !== trade) : [...chosen, trade],
    );
  // Free and Solo cover one trade; the rest switch on with the trial or Pro, without asking again.
  const oneTrade = settings.limits.maxTrades === 1;
  const trialAvailable = useSubscription().data?.trialAvailable ?? false;

  let question: ReactNode;
  if (step === 1)
    question = (
      <>
        <label htmlFor={`${id}-postcode`} className="block font-bold">
          Your postcode
        </label>
        <p id={`${id}-hint`} className="m-0 mt-0.5 text-sm text-muted">
          Where you work from. Leads are measured from here, and you can change it later in Alerts.
        </p>
        <input
          id={`${id}-postcode`}
          value={postcode}
          onChange={(event) => setPostcode(event.target.value)}
          autoComplete="postal-code"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-hint ${id}-message`}
          className={inputClassName(Boolean(error), "max-w-[12rem] uppercase")}
        />
      </>
    );
  else if (step === 2)
    question = (
      <fieldset
        className="m-0 border-0 p-0"
        aria-describedby={oneTrade ? `${id}-trades-hint ${id}-message` : `${id}-message`}
      >
        <legend className="mb-2 font-bold">Tick all that apply</legend>
        {oneTrade && (
          <p id={`${id}-trades-hint`} className="m-0 mb-3 text-sm text-muted">
            The first you tick is your main trade.{" "}
            {trialAvailable
              ? "Your free 14-day Pro trial covers every trade you tick; after it, the free plan and Solo cover your main trade."
              : "The free plan and Solo cover your main trade; Pro covers every trade you tick."}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {TRADES.map((trade) => (
            <label
              key={trade}
              className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border-2 border-muted bg-card px-3 py-2.5 font-semibold has-[:checked]:border-ink has-[:checked]:bg-chip"
            >
              <input
                type="checkbox"
                checked={trades.includes(trade)}
                onChange={() => toggleTrade(trade)}
                className="size-5 shrink-0"
              />
              {trade}
              {oneTrade && trades[0] === trade && (
                <span className="ml-auto rounded-full bg-navy px-2 py-0.5 text-xs font-bold text-white dark:bg-amber dark:text-navy">
                  Main
                </span>
              )}
            </label>
          ))}
        </div>
      </fieldset>
    );
  else
    question = (
      <>
        <DistanceSlider
          value={miles}
          min={settings.distanceMin}
          max={settings.distanceMax}
          label={formatDistance(miles)}
          onChange={setMiles}
        />
        {settings.base && (
          <AreaMap base={settings.base} radiusMiles={miles} postcode={settings.basePostcode} />
        )}
      </>
    );

  return (
    <div className="min-h-screen">
      <header className="brand-surface py-5 [--focus:#ffffff]">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4">
          <BrandLogo />
          <button
            type="button"
            onClick={() => signOut.mutate()}
            className="min-h-11 px-2 font-semibold text-side-link underline"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-10">
        <p className="m-0 text-sm font-semibold text-muted">Step {step} of 3</p>
        <h1 ref={heading} tabIndex={-1} className="m-0 mt-1 text-2xl font-bold">
          {TITLES[step]}
        </h1>

        <form noValidate onSubmit={(event) => void next(event)} className="mt-5">
          {question}
          <p
            id={`${id}-message`}
            role="status"
            className="m-0 mt-2 min-h-[2lh] text-sm font-semibold text-error"
          >
            {error}
          </p>
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="ghost" onClick={() => goTo((step - 1) as Step)}>
                Back
              </Button>
            )}
            <Button type="submit" disabled={sending}>
              {sending ? "Saving…" : step < 3 ? "Continue" : "Show my leads"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
