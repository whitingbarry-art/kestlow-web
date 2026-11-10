import { Lock } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent, type RefObject } from "react";
import { createJobsLoader, type JobsNear, type LoadJobs } from "../../api/jobs";
import { createHttpLeadEmailsApi, type LeadEmailsApi } from "../../api/leadEmails";
import { AREA_COUNCILS } from "../../data/areas";
import { TRADES } from "../../data/leads";
import { recordStep as defaultRecordStep, type RecordStep } from "../../logic/funnel";
import { signUpHref } from "../../logic/signUp";
import type { Trade } from "../../types/lead";
import { cn } from "../../utils/cn";
import { LeadCard } from "../leads/LeadCard";
import { buttonClassName } from "../ui/buttonStyles";
import { inputClassName } from "../ui/inputStyles";
import { LeadEmailsForm } from "./LeadEmailsForm";
import { PublicLayout } from "./PublicLayout";

const nothing = () => {};
const defaultLoad = createJobsLoader();
const defaultLeadEmailsApi = createHttpLeadEmailsApi();

interface JobsPageProps {
  /** The page's ?ref=, such as an ad's or a counter card's code. */
  source?: string;
  /** The trade the link was for, picked to start with (KES-160). */
  trade?: Trade;
  load?: LoadJobs;
  recordStep?: RecordStep;
  leadEmailsApi?: Pick<LeadEmailsApi, "request">;
}

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string; field?: "postcode" | "trade" }
  | { status: "failed" }
  | { status: "found"; jobs: JobsNear };

/**
 * The jobs page (KES-155), for tradespeople with no time to read: pick a trade, type a postcode,
 * and see straight away how many jobs there were near them and three real ones, with nothing to
 * sign up for first. The address and the rest of the jobs are what the trial and plans are for;
 * the weekly email is the easy next step. Big buttons and few words, for a thumb on a phone.
 */
export function JobsPage({
  source,
  trade: linkedTrade,
  load = defaultLoad,
  recordStep = defaultRecordStep,
  leadEmailsApi = defaultLeadEmailsApi,
}: JobsPageProps) {
  const id = useId();
  const [trade, setTrade] = useState<Trade | null>(linkedTrade ?? null);
  const [state, setState] = useState<State>({ status: "idle" });
  const answer = useRef<HTMLHeadingElement>(null);
  const problem = useRef<HTMLParagraphElement>(null);
  useEffect(() => recordStep("jobs_viewed", { source }), [recordStep, source]);
  useEffect(() => {
    if (state.status === "found") answer.current?.focus();
    if (state.status === "error" || state.status === "failed") problem.current?.focus();
  }, [state]);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("postcode");
    const postcode = typeof value === "string" ? value.trim() : "";
    if (!trade) return setState({ status: "error", error: "Pick your trade.", field: "trade" });
    if (!postcode)
      return setState({
        status: "error",
        error: "Type your postcode, like BR6.",
        field: "postcode",
      });
    setState({ status: "loading" });
    try {
      const result = await load(postcode, trade);
      if (!result.ok) return setState({ status: "error", ...result });
      recordStep("jobs_searched", { source });
      setState({ status: "found", jobs: result.jobs });
    } catch {
      setState({ status: "failed" });
    }
  }

  const error = state.status === "error" ? state : undefined;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <PublicLayout
      title="Jobs near you"
      description="See how many planning applications near you need your trade, and three real ones, free. Roofing, electrical, landscaping and groundworks around Bromley."
    >
      <div className="flex flex-col gap-8 text-lg leading-relaxed">
        <p className="m-0 text-xl">
          New building work near you, from the council's planning list. Free to look.
        </p>

        <form
          noValidate
          onSubmit={(event) => void search(event)}
          className="flex flex-col gap-6 rounded-card bg-card p-5 text-ink shadow-card"
        >
          <fieldset
            className="m-0 border-0 p-0"
            aria-describedby={error?.field === "trade" ? errorId : undefined}
          >
            <legend className="mb-3 text-xl font-bold">1. Your trade</legend>
            <div className="grid grid-cols-2 gap-3">
              {TRADES.map((option) => (
                <label
                  key={option}
                  className={cn(
                    "flex min-h-14 cursor-pointer items-center justify-center rounded-xl border-2 p-3 text-center font-bold",
                    "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)]",
                    trade === option ? "border-ink bg-ink text-card" : "border-muted bg-chip",
                  )}
                >
                  <input
                    type="radio"
                    name="trade"
                    value={option}
                    checked={trade === option}
                    onChange={() => setTrade(option)}
                    className="sr-only"
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor={`${id}-postcode`} className="block text-xl font-bold">
              2. Your postcode
            </label>
            {/* A hint, not a placeholder: a grey "BR1" in the box looked filled in (KES-160). */}
            <p id={hintId} className="mt-1 mb-3 text-base text-muted">
              Like BR6 or SE9 2AB
            </p>
            <input
              id={`${id}-postcode`}
              name="postcode"
              type="text"
              autoComplete="postal-code"
              autoCapitalize="characters"
              spellCheck={false}
              aria-invalid={error?.field === "postcode" || undefined}
              aria-describedby={error?.field === "postcode" ? `${hintId} ${errorId}` : hintId}
              className={inputClassName(error?.field === "postcode", "max-w-48 text-xl")}
            />
          </div>

          {(error || state.status === "failed") && (
            <p
              id={errorId}
              ref={problem}
              tabIndex={-1}
              role="alert"
              className="m-0 font-semibold text-error"
            >
              {error ? error.error : "Something went wrong. Try again in a moment."}
            </p>
          )}

          <button
            type="submit"
            disabled={state.status === "loading"}
            className={buttonClassName("primary", "flex-none py-4 text-xl")}
          >
            {state.status === "loading" ? "Looking…" : "Show me the jobs"}
          </button>
        </form>

        {state.status === "found" && (
          <Results
            jobs={state.jobs}
            answer={answer}
            source={source}
            recordStep={recordStep}
            leadEmailsApi={leadEmailsApi}
          />
        )}
      </div>
    </PublicLayout>
  );
}

function Results({
  jobs,
  answer,
  source,
  recordStep,
  leadEmailsApi,
}: {
  jobs: JobsNear;
  answer: RefObject<HTMLHeadingElement | null>;
  source?: string;
  recordStep: RecordStep;
  leadEmailsApi: Pick<LeadEmailsApi, "request">;
}) {
  const work = `${jobs.trade.toLowerCase()} ${jobs.total === 1 ? "job" : "jobs"}`;

  if (jobs.total === 0)
    return (
      <section aria-labelledby="jobs-answer" className="flex flex-col gap-3">
        <h2 ref={answer} id="jobs-answer" tabIndex={-1} className="m-0 text-2xl font-bold">
          No {jobs.trade.toLowerCase()} jobs near {jobs.postcode} yet
        </h2>
        <p className="m-0">
          Kestlow covers {AREA_COUNCILS.length} councils around Bromley for now:{" "}
          {AREA_COUNCILS.map((council) => council.name).join(", ")}. More are coming.
        </p>
      </section>
    );

  const more = jobs.total - jobs.examples.length;
  return (
    <section aria-labelledby="jobs-answer" className="flex flex-col gap-6">
      <div>
        <h2 ref={answer} id="jobs-answer" tabIndex={-1} className="m-0 text-2xl font-bold">
          <span className="text-5xl">{jobs.total.toLocaleString("en-GB")}</span> {work} near{" "}
          {jobs.postcode}
        </h2>
        <p className="mt-1 mb-0 text-muted">
          Within {jobs.radiusMiles} miles, in the last {jobs.days} days.
        </p>
      </div>

      {jobs.examples.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="m-0 text-xl font-bold">Here are {jobs.examples.length} of them</h3>
          <ul className="m-0 flex flex-col gap-3 p-0">
            {jobs.examples.map((lead) => (
              <li key={lead.id} className="list-none">
                <LeadCard
                  lead={lead}
                  selected={false}
                  saved={false}
                  clickable={false}
                  onOpen={nothing}
                  onToggleSave={nothing}
                  actions={false}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-card border-2 border-ink p-5">
        <h3 className="m-0 flex items-center gap-2 text-xl font-bold">
          <Lock aria-hidden="true" className="size-6 flex-none" />
          {more > 0 ? `${more.toLocaleString("en-GB")} more, with the address` : "See the address"}
        </h3>
        <p className="m-0">
          Get every job the morning it's in, with the full address and the council's page. Free for
          14 days, no card needed.
        </p>
        <a
          href={signUpHref(source)}
          onClick={() => recordStep("trial_tapped", { source })}
          className={buttonClassName("primary", "flex-none py-4 text-xl")}
        >
          See them all free
        </a>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="m-0 text-xl font-bold">Or get them free every Monday</h3>
        <p className="m-0">Just your email. No account, no password.</p>
        <LeadEmailsForm
          api={leadEmailsApi}
          source={source}
          trade={jobs.trade}
          postcode={jobs.postcode}
        />
      </div>
    </section>
  );
}
