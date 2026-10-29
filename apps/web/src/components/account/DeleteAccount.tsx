import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useDeleteAccount } from "../../hooks/useSession";
import { Button } from "../ui/Button";
import { PasswordInput } from "../ui/PasswordInput";

/**
 * Deletes the account (KES-43). Two steps, so it can't happen by accident: "Delete my account…"
 * explains what goes and asks for the password, then a second button deletes. Afterwards the
 * sign-in screen shows, as there's no account left.
 */
export function DeleteAccount() {
  const id = useId();
  const deleteAccount = useDeleteAccount();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const passwordBox = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);

  // Into the password box on opening, and back to the button on cancelling.
  useEffect(() => {
    if (confirming) passwordBox.current?.focus();
    else if (wasConfirming.current) opener.current?.focus();
    wasConfirming.current = confirming;
  }, [confirming]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password) return setError("Enter your password to delete your account.");
    setError(null);
    const result = await deleteAccount.mutateAsync(password).catch(
      () =>
        ({
          ok: false,
          message: "We couldn't reach Kestlow. Please try again in a minute.",
        }) as const,
    );
    if (!result.ok) setError(result.message);
  }

  const cancel = () => {
    setConfirming(false);
    setPassword("");
    setError(null);
  };

  return (
    <div className="py-3.5">
      <p id={`${id}-what`} className="m-0">
        This deletes your account, your saved leads and your alert settings for good. It can't be
        undone.
      </p>
      {confirming ? (
        <form noValidate onSubmit={(event) => void submit(event)} className="mt-3">
          <label htmlFor={`${id}-password`} className="block font-bold">
            Enter your password to confirm
          </label>
          <PasswordInput
            ref={passwordBox}
            id={`${id}-password`}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            aria-describedby={`${id}-what ${id}-message`}
          />
          <p
            id={`${id}-message`}
            role="status"
            className="m-0 mt-1 min-h-[2lh] text-sm font-semibold text-error"
          >
            {error}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={cancel}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={deleteAccount.isPending}>
              {deleteAccount.isPending ? "Deleting…" : "Delete my account"}
            </Button>
          </div>
        </form>
      ) : (
        <Button
          ref={opener}
          variant="danger-ghost"
          onClick={() => setConfirming(true)}
          className="mt-3 w-full"
        >
          Delete my account…
        </Button>
      )}
    </div>
  );
}
