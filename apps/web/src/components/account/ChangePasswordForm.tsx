import { useId, useRef, useState, type FormEvent } from "react";
import { useAuthApi } from "../../api/AuthApiContext";
import { PASSWORD_HINT, WEAK_PASSWORD_MESSAGE, type AuthResult } from "../../api/auth";
import { usePasswordStrength } from "../../hooks/usePasswordStrength";
import { useSession } from "../../hooks/useSession";
import { PasswordStrengthMeter } from "../auth/PasswordStrengthMeter";
import { Button } from "../ui/Button";
import { PasswordInput } from "../ui/PasswordInput";
import { Spinner } from "../ui/Spinner";

/**
 * Changes the password (KES-43). Like registering, Good or Strong passwords are accepted, counting
 * the person's own name and email as easy to guess; the API checks too. Other devices are signed
 * out, so an old password someone else knew stops working everywhere.
 */
export function ChangePasswordForm() {
  const api = useAuthApi();
  const user = useSession().data;
  const id = useId();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [shown, setShown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const busy = useRef(false);
  const personal = [user?.name ?? "", user?.email ?? ""];
  const strength = usePasswordStrength(next, personal);

  // Off from the first tap, while the password checker loads too, so it's never sent twice.
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setSending(true);
    setShown(false);
    setDone(false);
    try {
      await send();
    } finally {
      busy.current = false;
      setSending(false);
    }
  }

  async function send() {
    if (!current) return setError("Enter your current password.");
    // Weak passwords are refused (KES-167); the API checks too, this saves the round trip.
    const checker = await import("../../logic/password").catch(() => null);
    if (
      next.length >= 8 &&
      checker &&
      !checker.isAcceptable(checker.checkPassword(next, personal).strength)
    )
      return setError(WEAK_PASSWORD_MESSAGE);

    setError(null);
    let result: AuthResult;
    try {
      result = await api.changePassword({ currentPassword: current, newPassword: next });
    } catch {
      result = { ok: false, message: "We couldn't reach Kestlow. Please try again in a minute." };
    }
    if (!result.ok) return setError(result.message);
    setCurrent("");
    setNext("");
    setDone(true);
  }

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="py-3.5">
      <label htmlFor={`${id}-current`} className="block font-bold">
        Current password
      </label>
      <PasswordInput
        id={`${id}-current`}
        value={current}
        onChange={(event) => setCurrent(event.target.value)}
        autoComplete="current-password"
        shown={shown}
        onShownChange={setShown}
      />

      <label htmlFor={`${id}-new`} className="mt-4 block font-bold">
        New password
      </label>
      <p id={`${id}-hint`} className="mt-0.5 mb-0 text-sm text-muted">
        {PASSWORD_HINT}
      </p>
      <PasswordInput
        id={`${id}-new`}
        value={next}
        onChange={(event) => setNext(event.target.value)}
        autoComplete="new-password"
        aria-describedby={`${id}-hint`}
        shown={shown}
        onShownChange={setShown}
      />
      <PasswordStrengthMeter check={strength} />

      <p role="status" className="m-0 mt-1 min-h-[2lh] text-sm font-semibold">
        {error ? (
          <span className="text-error">{error}</span>
        ) : done ? (
          "Password changed. You've been signed out on your other devices."
        ) : null}
      </p>
      <Button type="submit" disabled={sending} className="w-full">
        {sending && <Spinner />}
        {sending ? "Changing…" : "Change password"}
      </Button>
    </form>
  );
}
