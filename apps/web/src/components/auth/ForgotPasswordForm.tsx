import { useId, useState, type FormEvent } from "react";
import { useAuthApi } from "../../api/AuthApiContext";
import type { AuthResult } from "../../api/auth";
import { buttonClassName } from "../ui/buttonStyles";
import { inputClassName } from "../ui/inputStyles";

/**
 * Asks for a reset link (KES-41). The answer is the same whether or not the email has an account,
 * so nobody can use it to find out who's signed up.
 */
export function ForgotPasswordForm() {
  const api = useAuthApi();
  const id = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return setError("Enter the email address you signed up with.");
    setSending(true);
    setError(null);
    let result: AuthResult;
    try {
      result = await api.requestPasswordReset(email.trim());
    } catch {
      result = { ok: false, message: "We couldn't reach Kestlow. Please try again in a minute." };
    }
    setSending(false);
    if (result.ok) setSentTo(email.trim());
    else setError(result.message);
  }

  return (
    <form
      noValidate
      onSubmit={(event) => void submit(event)}
      className="flex flex-col gap-4 rounded-card bg-card p-5 shadow-card"
    >
      <p className="m-0 text-muted">
        Enter the email you signed up with and we'll send a link to choose a new password.
      </p>
      <div>
        <label htmlFor={`${id}-email`} className="block font-bold">
          Email address
        </label>
        <input
          id={`${id}-email`}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-message`}
          className={inputClassName(Boolean(error))}
        />
      </div>
      <p id={`${id}-message`} role="status" className="m-0 min-h-[3lh] text-sm font-semibold">
        {error ? (
          <span className="text-error">{error}</span>
        ) : sentTo ? (
          `If there's a Kestlow account for ${sentTo}, we've sent a link. It works for one hour. Check your spam folder too.`
        ) : null}
      </p>
      <button type="submit" disabled={sending} className={buttonClassName("primary", "w-full")}>
        {sending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
