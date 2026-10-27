import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { JoinWaitlist, SignupErrors } from "../../api/waitlist";
import { TRADES } from "../../data/leads";
import { CURRENT_SPEND, PLAN_CHOICES, WOULD_PAY, type Option } from "../../data/waitlist";
import type { Trade } from "../../types/lead";
import { cn } from "../../utils/cn";
import { buttonClassName } from "../ui/buttonStyles";

type Field = keyof SignupErrors;
type Status = "idle" | "sending" | "joined" | "failed";

// The order the questions appear in, so the error summary lists them the same way.
const FIELDS: Field[] = ["email", "postcode", "trades", "currentSpend", "wouldPay", "plan"];

interface WaitlistFormProps {
  join: JoinWaitlist;
}

/**
 * The sign-up and survey (KES-97). The API checks the answers, and any that need fixing are
 * listed in a summary that takes focus, with each linking to its question.
 */
export function WaitlistForm({ join }: WaitlistFormProps) {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<SignupErrors>({});
  const summary = useRef<HTMLDivElement>(null);
  const joined = useRef<HTMLHeadingElement>(null);
  const fieldId = (field: Field) => `${id}-${field}`;
  const errorId = (field: Field) => `${id}-${field}-error`;
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (status === "joined") joined.current?.focus();
    else if (hasErrors) summary.current?.focus();
  }, [status, errors, hasErrors]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => {
      const value = form.get(name);
      return typeof value === "string" ? value : "";
    };
    setStatus("sending");
    try {
      const result = await join({
        email: text("email"),
        postcode: text("postcode"),
        trades: form.getAll("trades").map(String) as Trade[],
        currentSpend: text("currentSpend"),
        wouldPay: text("wouldPay"),
        plan: text("plan"),
        website: text("website"),
      });
      setErrors(result.ok ? {} : result.errors);
      setStatus(result.ok ? "joined" : "idle");
    } catch {
      setStatus("failed");
    }
  }

  if (status === "joined") {
    return (
      <div className="rounded-card bg-card p-5 shadow-card">
        <h3 ref={joined} tabIndex={-1} className="m-0 text-xl font-bold">
          You're on the list
        </h3>
        <p className="mt-2 text-muted">
          We'll email you when Kestlow opens in your area. Thanks for answering the questions: they
          help us set fair prices and decide where to start.
        </p>
      </div>
    );
  }

  const describedBy = (field: Field, hint?: string) =>
    cn(hint, errors[field] && errorId(field)) || undefined;
  const fieldError = (field: Field) =>
    errors[field] && (
      <p id={errorId(field)} className="mt-1 mb-0 font-semibold text-error">
        {errors[field]}
      </p>
    );

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="flex flex-col gap-5">
      {hasErrors && (
        <div
          ref={summary}
          role="group"
          tabIndex={-1}
          aria-labelledby={`${id}-summary`}
          className="rounded-card border-2 border-error bg-card p-4"
        >
          <h3 id={`${id}-summary`} className="m-0 text-base font-bold">
            Some answers need fixing
          </h3>
          <ul className="mt-2 mb-0 list-disc pl-5">
            {FIELDS.filter((field) => errors[field]).map((field) => (
              <li key={field}>
                <a href={`#${fieldId(field)}`} className="font-semibold text-error underline">
                  {errors[field]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label htmlFor={fieldId("email")} className="block font-bold">
          Email address
        </label>
        <input
          id={fieldId("email")}
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          aria-invalid={!!errors.email || undefined}
          aria-describedby={describedBy("email")}
          className={inputClassName(!!errors.email)}
        />
        {fieldError("email")}
      </div>

      <div>
        <label htmlFor={fieldId("postcode")} className="block font-bold">
          Postcode you work from
        </label>
        <p id={`${id}-postcode-hint`} className="mt-0.5 mb-0 text-sm text-muted">
          The first half is enough, like BR1. We only keep the first half.
        </p>
        <input
          id={fieldId("postcode")}
          name="postcode"
          type="text"
          autoComplete="postal-code"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={!!errors.postcode || undefined}
          aria-describedby={describedBy("postcode", `${id}-postcode-hint`)}
          className={cn(inputClassName(!!errors.postcode), "max-w-[12rem]")}
        />
        {fieldError("postcode")}
      </div>

      <Choices
        type="checkbox"
        name="trades"
        legend="Which trades do you work in?"
        hint="Choose all that apply."
        options={TRADES.map((trade) => ({ value: trade, label: trade }))}
        firstId={fieldId("trades")}
        error={errors.trades}
        errorId={errorId("trades")}
      />

      <Choices
        type="radio"
        name="currentSpend"
        legend="What do you spend on finding work now?"
        hint="Lead sites, directories and adverts, added up."
        options={CURRENT_SPEND}
        firstId={fieldId("currentSpend")}
        error={errors.currentSpend}
        errorId={errorId("currentSpend")}
      />

      <Choices
        type="radio"
        name="wouldPay"
        legend="What would you pay for Kestlow?"
        options={WOULD_PAY}
        firstId={fieldId("wouldPay")}
        error={errors.wouldPay}
        errorId={errorId("wouldPay")}
      />

      <Choices
        type="radio"
        name="plan"
        legend="Which plan would you pick at launch?"
        hint="You're not signing up to pay; this just tells us which prices work."
        options={PLAN_CHOICES}
        firstId={fieldId("plan")}
        error={errors.plan}
        errorId={errorId("plan")}
      />

      {/* A spam trap: hidden from people and screen readers, but bots fill it in. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {status === "failed" && (
        <p role="alert" className="m-0 font-semibold text-error">
          We couldn't add you just now. Please try again in a minute.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className={buttonClassName("primary", "flex-none self-start px-6 disabled:opacity-70")}
      >
        {status === "sending" ? "Joining…" : "Join the waitlist"}
      </button>
    </form>
  );
}

function inputClassName(invalid: boolean) {
  return cn(
    "mt-1.5 block w-full rounded-xl border-2 bg-card px-3 py-2.5 text-base text-ink",
    invalid ? "border-error" : "border-muted",
  );
}

interface ChoicesProps {
  type: "radio" | "checkbox";
  name: string;
  legend: string;
  hint?: string;
  options: Option[];
  /** The first option's id, which the error summary links to. */
  firstId: string;
  error?: string;
  errorId: string;
}

function Choices({ type, name, legend, hint, options, firstId, error, errorId }: ChoicesProps) {
  const id = useId();
  const describedBy = cn(hint && `${id}-hint`, error && errorId) || undefined;

  return (
    <fieldset aria-describedby={describedBy} className="m-0 border-0 p-0">
      <legend className="p-0 font-bold">{legend}</legend>
      {hint && (
        <p id={`${id}-hint`} className="mt-0.5 mb-0 text-sm text-muted">
          {hint}
        </p>
      )}
      <div className="mt-1.5 grid gap-1 sm:grid-cols-2">
        {options.map((option, index) => (
          <label
            key={option.value}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-line bg-card px-3 py-2"
          >
            <input
              id={index === 0 ? firstId : undefined}
              type={type}
              name={name}
              value={option.value}
              aria-invalid={error ? true : undefined}
              className="size-5 shrink-0 accent-navy dark:accent-amber"
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} className="mt-1 mb-0 font-semibold text-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
