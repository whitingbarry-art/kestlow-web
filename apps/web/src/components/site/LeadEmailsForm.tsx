import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { LeadEmailsApi, LeadEmailsErrors } from "../../api/leadEmails";
import { AREA_COUNCILS } from "../../data/areas";
import { CONTACT } from "../../data/contact";
import { TRADES } from "../../data/leads";
import type { Trade } from "../../types/lead";
import { buttonClassName } from "../ui/buttonStyles";
import { inputClassName } from "../ui/inputStyles";

type Field = keyof LeadEmailsErrors;
type Status = "idle" | "sending" | "sent" | "outside" | "failed";

// The order the fields appear in, so the error summary lists them the same way.
const FIELDS: Field[] = ["trade", "postcode", "email"];

/** A postcode as it's written, "br11aa" → "BR1 1AA", for saying it back; a first half stays as it is. */
const tidyPostcode = (input: string) => {
  const postcode = input.toUpperCase().replace(/\s+/g, "");
  return postcode.length > 4 ? `${postcode.slice(0, -3)} ${postcode.slice(-3)}` : postcode;
};

interface LeadEmailsFormProps {
  api: Pick<LeadEmailsApi, "request">;
  /** The page's ?ref=, carried to the request so we can see which ad or card works. */
  source?: string;
  /** Chosen already, on a trade's own page. */
  trade?: Trade;
  /** Given already, on the jobs page (KES-155). */
  postcode?: string;
}

/**
 * Free weekly leads by email, without an account (KES-137): the lighter first step, for people
 * not ready to make an account. Trade, postcode and email; the API emails a link to confirm.
 * Anything that needs fixing is listed in a summary that takes focus, as on Contact us.
 */
export function LeadEmailsForm({ api, source, trade, postcode }: LeadEmailsFormProps) {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<LeadEmailsErrors>({});
  const [sentTo, setSentTo] = useState({ email: "", postcode: "" });
  const summary = useRef<HTMLDivElement>(null);
  const answer = useRef<HTMLHeadingElement>(null);
  const fieldId = (field: Field) => `${id}-${field}`;
  const errorId = (field: Field) => `${id}-${field}-error`;
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (status === "sent" || status === "outside") answer.current?.focus();
    else if (hasErrors) summary.current?.focus();
  }, [status, errors, hasErrors]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (field: string) => {
      const value = form.get(field);
      return typeof value === "string" ? value.trim() : "";
    };
    setSentTo({ email: text("email"), postcode: tidyPostcode(text("postcode")) });
    setStatus("sending");
    try {
      const result = await api.request({
        trade: text("trade") as Trade | "",
        postcode: text("postcode"),
        email: text("email"),
        source,
        website: text("website"),
      });
      setErrors(result.ok ? {} : result.errors);
      setStatus(result.ok ? result.status : "idle");
    } catch {
      setStatus("failed");
    }
  }

  if (status === "sent")
    return (
      <div className="rounded-card bg-card p-5 text-ink shadow-card">
        <h3 ref={answer} tabIndex={-1} className="m-0 text-xl font-bold">
          Check your inbox
        </h3>
        <p className="mt-2 mb-0">
          We've sent a link to <b>{sentTo.email}</b>. Click it to confirm, and your first leads are
          on their way. If it isn't there in a few minutes, look in your junk folder.
        </p>
      </div>
    );

  if (status === "outside")
    return (
      <div className="rounded-card bg-card p-5 text-ink shadow-card">
        <h3 ref={answer} tabIndex={-1} className="m-0 text-xl font-bold">
          We don't cover {sentTo.postcode} yet
        </h3>
        <p className="mt-2 mb-0">
          For now, Kestlow covers {AREA_COUNCILS.length} councils around Bromley:{" "}
          {AREA_COUNCILS.map((council) => council.name).join(", ")}. More are coming.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className={buttonClassName("ghost", "mt-4 flex-none self-start px-5")}
        >
          Try another postcode
        </button>
      </div>
    );

  const describedBy = (field: Field, hint?: string) =>
    [hint, errors[field] ? errorId(field) : undefined].filter(Boolean).join(" ") || undefined;
  const fieldError = (field: Field) =>
    errors[field] && (
      <p id={errorId(field)} className="mt-1 mb-0 font-semibold text-error">
        {errors[field]}
      </p>
    );
  const label = (field: Field, text: string) => (
    <label htmlFor={fieldId(field)} className="block font-bold">
      {text}
    </label>
  );

  return (
    <form
      noValidate
      onSubmit={(event) => void submit(event)}
      className="flex flex-col gap-4 rounded-card bg-card p-5 text-ink shadow-card"
    >
      {hasErrors && (
        <div
          ref={summary}
          role="group"
          tabIndex={-1}
          aria-labelledby={`${id}-summary`}
          className="rounded-card border-2 border-error p-4"
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
        {label("trade", "Your trade")}
        <select
          id={fieldId("trade")}
          name="trade"
          defaultValue={trade ?? ""}
          aria-invalid={!!errors.trade || undefined}
          aria-describedby={describedBy("trade")}
          className={inputClassName(!!errors.trade)}
        >
          <option value="" disabled>
            Choose one
          </option>
          {TRADES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {fieldError("trade")}
      </div>

      <div>
        {label("postcode", "Your postcode")}
        <p id={`${id}-postcode-hint`} className="mt-0.5 mb-0 text-sm text-muted">
          Or just the first half, like BR1
        </p>
        <input
          id={fieldId("postcode")}
          name="postcode"
          type="text"
          defaultValue={postcode}
          autoComplete="postal-code"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={!!errors.postcode || undefined}
          aria-describedby={describedBy("postcode", `${id}-postcode-hint`)}
          className={inputClassName(!!errors.postcode, "max-w-48")}
        />
        {fieldError("postcode")}
      </div>

      <div>
        {label("email", "Your email")}
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

      {/* A spam trap: hidden from people and screen readers, but bots fill it in. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {status === "failed" && (
        <p role="alert" className="m-0 font-semibold text-error">
          That couldn't be sent just now. Please try again in a minute, or email{" "}
          <a href={`mailto:${CONTACT.support}`} className="underline">
            {CONTACT.support}
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className={buttonClassName("primary", "flex-none self-start px-6 disabled:opacity-70")}
      >
        {status === "sending" ? "Sending…" : "Send me this week's leads"}
      </button>
      <p className="m-0 text-sm text-muted">
        Free, one email a week, and you can stop any time. We'll email you a link to confirm first.
        See our{" "}
        <a href="/privacy" className="font-semibold text-ink underline">
          privacy notice
        </a>
        .
      </p>
    </form>
  );
}
