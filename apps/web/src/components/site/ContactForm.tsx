import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { ContactErrors, SendContact } from "../../api/contact";
import { CONTACT, CONTACT_TOPICS, type ContactTopic } from "../../data/contact";
import { cn } from "../../utils/cn";
import { buttonClassName } from "../ui/buttonStyles";
import { inputClassName } from "../ui/inputStyles";

type Field = keyof ContactErrors;
type Status = "idle" | "sending" | "sent" | "failed";

// The order the fields appear in, so the error summary lists them the same way.
const FIELDS: Field[] = ["name", "email", "topic", "message"];
const MAX_MESSAGE_LENGTH = 5000;

interface ContactFormProps {
  send: SendContact;
  /** Filled in for someone who's signed in. */
  name?: string;
  email?: string;
}

/**
 * The Contact us form (KES-116). The API checks it, and anything that needs fixing is listed in a
 * summary that takes focus, with each linking to its field, as on the waitlist form.
 */
export function ContactForm({ send, name = "", email = "" }: ContactFormProps) {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<ContactErrors>({});
  const summary = useRef<HTMLDivElement>(null);
  const sent = useRef<HTMLHeadingElement>(null);
  const fieldId = (field: Field) => `${id}-${field}`;
  const errorId = (field: Field) => `${id}-${field}-error`;
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (status === "sent") sent.current?.focus();
    else if (hasErrors) summary.current?.focus();
  }, [status, errors, hasErrors]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (field: string) => {
      const value = form.get(field);
      return typeof value === "string" ? value : "";
    };
    setStatus("sending");
    try {
      const result = await send({
        name: text("name"),
        email: text("email"),
        topic: text("topic") as ContactTopic | "",
        message: text("message"),
        website: text("website"),
      });
      setErrors(result.ok ? {} : result.errors);
      setStatus(result.ok ? "sent" : "idle");
    } catch {
      setStatus("failed");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-card bg-card p-5 shadow-card">
        <h2 ref={sent} tabIndex={-1} className="m-0 text-xl font-bold">
          Thanks, your message is on its way
        </h2>
        <p className="mt-2 mb-0 text-muted">
          We read every message and usually reply within two working days, to the email address you
          gave.
        </p>
      </div>
    );
  }

  const describedBy = (field: Field) => (errors[field] ? errorId(field) : undefined);
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
    <form noValidate onSubmit={(event) => void submit(event)} className="flex flex-col gap-5">
      {hasErrors && (
        <div
          ref={summary}
          role="group"
          tabIndex={-1}
          aria-labelledby={`${id}-summary`}
          className="rounded-card border-2 border-error bg-card p-4"
        >
          <h2 id={`${id}-summary`} className="m-0 text-base font-bold">
            Some answers need fixing
          </h2>
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
        {label("name", "Your name")}
        <input
          id={fieldId("name")}
          name="name"
          type="text"
          autoComplete="name"
          defaultValue={name}
          aria-invalid={!!errors.name || undefined}
          aria-describedby={describedBy("name")}
          className={inputClassName(!!errors.name)}
        />
        {fieldError("name")}
      </div>

      <div>
        {label("email", "Email address")}
        <input
          id={fieldId("email")}
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          defaultValue={email}
          aria-invalid={!!errors.email || undefined}
          aria-describedby={describedBy("email")}
          className={inputClassName(!!errors.email)}
        />
        {fieldError("email")}
      </div>

      <div>
        {label("topic", "What's it about?")}
        <select
          id={fieldId("topic")}
          name="topic"
          defaultValue=""
          aria-invalid={!!errors.topic || undefined}
          aria-describedby={describedBy("topic")}
          className={inputClassName(!!errors.topic)}
        >
          <option value="" disabled>
            Choose one
          </option>
          {CONTACT_TOPICS.map((topic) => (
            <option key={topic.value} value={topic.value}>
              {topic.label}
            </option>
          ))}
        </select>
        {fieldError("topic")}
      </div>

      <div>
        {label("message", "Your message")}
        <textarea
          id={fieldId("message")}
          name="message"
          rows={7}
          maxLength={MAX_MESSAGE_LENGTH}
          aria-invalid={!!errors.message || undefined}
          aria-describedby={describedBy("message")}
          className={inputClassName(!!errors.message, "resize-y")}
        />
        {fieldError("message")}
      </div>

      {/* A spam trap: hidden from people and screen readers, but bots fill it in. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {status === "failed" && (
        <p role="alert" className="m-0 font-semibold text-error">
          Your message couldn't be sent just now. Please try again in a minute, or email{" "}
          <a href={`mailto:${CONTACT.support}`} className="underline">
            {CONTACT.support}
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className={buttonClassName("primary", cn("flex-none self-start px-6 disabled:opacity-70"))}
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
