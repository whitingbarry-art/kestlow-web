import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useAuthApi } from "../../api/AuthApiContext";
import { PASSWORD_HINT, WEAK_PASSWORD_MESSAGE, type AuthResult } from "../../api/auth";
import { pageTitle } from "../../data/site";
import { usePasswordStrength } from "../../hooks/usePasswordStrength";
import { buttonClassName } from "../ui/buttonStyles";
import { PasswordInput } from "../ui/PasswordInput";
import { Spinner } from "../ui/Spinner";
import { AuthLayout } from "./AuthLayout";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

interface ResetPasswordScreenProps {
  /** From the emailed link's ?token=; null when the link was cut short. */
  token: string | null;
}

/**
 * Where a reset email's link opens (KES-41): choose a new password, Good or Strong (KES-167). Every
 * device is signed out, so the next step is signing in with it.
 */
export function ResetPasswordScreen({ token }: ResetPasswordScreenProps) {
  const api = useAuthApi();
  const id = useId();
  const [password, setPassword] = useState("");
  const [shown, setShown] = useState(false);
  const [error, setError] = useState<string | null>(
    token ? null : "This link isn't complete. Try copying the whole link from the email.",
  );
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const busy = useRef(false);
  const strength = usePasswordStrength(password, []);

  useEffect(() => {
    document.title = pageTitle("Choose a new password");
  }, []);

  // Off from the first tap, while the password checker loads too, so it's never sent twice.
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || !token) return;
    busy.current = true;
    setSending(true);
    setShown(false);
    try {
      await send(token);
    } finally {
      busy.current = false;
      setSending(false);
    }
  }

  async function send(resetToken: string) {
    const checker = await import("../../logic/password").catch(() => null);
    if (
      password.length >= 8 &&
      checker &&
      !checker.isAcceptable(checker.checkPassword(password, []).strength)
    )
      return setError(WEAK_PASSWORD_MESSAGE);

    setError(null);
    let result: AuthResult;
    try {
      result = await api.resetPassword({ token: resetToken, newPassword: password });
    } catch {
      result = { ok: false, message: "We couldn't reach Kestlow. Please try again in a minute." };
    }
    if (result.ok) setDone(true);
    else setError(result.message);
  }

  if (done)
    return (
      <AuthLayout>
        <h1 className="m-0 text-2xl font-bold">Password changed</h1>
        <p role="status" className="mt-3 text-muted">
          You've been signed out everywhere. Sign in with your new password.
        </p>
        <a href="/" className={buttonClassName("primary", "mt-4 block w-full")}>
          Sign in
        </a>
      </AuthLayout>
    );

  return (
    <AuthLayout>
      <h1 className="m-0 text-2xl font-bold">Choose a new password</h1>
      <form
        noValidate
        onSubmit={(event) => void submit(event)}
        className="mt-6 flex flex-col gap-4 rounded-card bg-card p-5 shadow-card"
      >
        <div>
          <label htmlFor={`${id}-password`} className="block font-bold">
            New password
          </label>
          <p id={`${id}-hint`} className="mt-0.5 mb-0 text-sm text-muted">
            {PASSWORD_HINT}
          </p>
          <PasswordInput
            id={`${id}-password`}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            aria-describedby={`${id}-hint ${id}-message`}
            shown={shown}
            onShownChange={setShown}
          />
          <PasswordStrengthMeter check={strength} />
        </div>
        <p
          id={`${id}-message`}
          role="status"
          className="m-0 min-h-[2lh] text-sm font-semibold text-error"
        >
          {error}
        </p>
        <button
          type="submit"
          disabled={sending || !token}
          className={buttonClassName("primary", "w-full")}
        >
          {sending && <Spinner />}
          {sending ? "Saving…" : "Save new password"}
        </button>
      </form>
      {error && token !== null && /expired|used/.test(error) && (
        <p className="mt-4">
          <a href="/?forgot" className="font-semibold text-ink underline">
            Ask for a new link
          </a>
        </p>
      )}
    </AuthLayout>
  );
}
