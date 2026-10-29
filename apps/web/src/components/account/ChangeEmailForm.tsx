import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useAuthApi } from "../../api/AuthApiContext";
import type { AuthResult } from "../../api/auth";
import { Button } from "../ui/Button";
import { inputClassName } from "../ui/inputStyles";
import { PasswordInput } from "../ui/PasswordInput";

/**
 * Changes the email address (KES-43): the new one gets a link and the email changes once it's
 * used, so a typo can't lock anyone out. The password's needed, and the old address is told.
 */
export function ChangeEmailForm() {
  const api = useAuthApi();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const emailBox = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Into the form on opening, and back to the button on closing.
  useEffect(() => {
    if (open) emailBox.current?.focus();
    else if (wasOpen.current) opener.current?.focus();
    wasOpen.current = open;
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newEmail.trim()) return setError("Enter your new email address.");
    if (!password) return setError("Enter your password to change your email.");
    setSending(true);
    setError(null);
    let result: AuthResult;
    try {
      result = await api.changeEmail({ newEmail: newEmail.trim(), password });
    } catch {
      result = { ok: false, message: "We couldn't reach Kestlow. Please try again in a minute." };
    }
    setSending(false);
    if (!result.ok) return setError(result.message);
    setSentTo(newEmail.trim());
    setOpen(false);
    setNewEmail("");
    setPassword("");
  }

  const cancel = () => {
    setOpen(false);
    setError(null);
    setPassword("");
  };

  if (!open)
    return (
      <div className="pb-3.5">
        <p role="status" className="m-0 min-h-[1lh] text-sm font-semibold">
          {sentTo &&
            `Check ${sentTo} for a link. Your email changes once you've used it; until then it stays as it is.`}
        </p>
        <Button ref={opener} variant="ghost" onClick={() => setOpen(true)} className="mt-1 w-full">
          Change email…
        </Button>
      </div>
    );

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="pb-3.5">
      <label htmlFor={`${id}-email`} className="block font-bold">
        New email address
      </label>
      <input
        ref={emailBox}
        id={`${id}-email`}
        type="email"
        autoComplete="email"
        value={newEmail}
        onChange={(event) => setNewEmail(event.target.value)}
        aria-describedby={`${id}-message`}
        className={inputClassName()}
      />
      <label htmlFor={`${id}-password`} className="mt-4 block font-bold">
        Your password
      </label>
      <PasswordInput
        id={`${id}-password`}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        aria-describedby={`${id}-message`}
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
        <Button type="submit" disabled={sending}>
          {sending ? "Sending…" : "Send link"}
        </Button>
      </div>
    </form>
  );
}
