import { useId, useState, type FormEvent } from "react";
import { useAuthApi } from "../../api/AuthApiContext";
import { WEAK_PASSWORD_MESSAGE, type AuthResult } from "../../api/auth";
import { usePasswordStrength } from "../../hooks/usePasswordStrength";
import { useSession } from "../../hooks/useSession";
import { PasswordStrengthMeter } from "../auth/PasswordStrengthMeter";
import { Button } from "../ui/Button";
import { PasswordInput } from "../ui/PasswordInput";

/**
 * Changes the password (KES-43). Like registering, only Strong passwords are accepted, counting
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
  const personal = [user?.name ?? "", user?.email ?? ""];
  const strength = usePasswordStrength(next, personal);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShown(false);
    setDone(false);
    if (!current) return setError("Enter your current password.");
    // Only strong passwords are accepted; the API checks too, this saves the round trip.
    const checker = await import("../../logic/password").catch(() => null);
    if (next.length >= 8 && checker && checker.checkPassword(next, personal).strength !== "strong")
      return setError(WEAK_PASSWORD_MESSAGE);

    setSending(true);
    setError(null);
    let result: AuthResult;
    try {
      result = await api.changePassword({ currentPassword: current, newPassword: next });
    } catch {
      result = { ok: false, message: "We couldn't reach Kestlow. Please try again in a minute." };
    }
    setSending(false);
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
        It must reach Strong. Three random words, like ladder-teapot-rain, work well.
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
        {sending ? "Changing…" : "Change password"}
      </Button>
    </form>
  );
}
