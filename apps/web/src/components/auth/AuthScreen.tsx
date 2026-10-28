import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useAuthApi } from "../../api/AuthApiContext";
import { WEAK_PASSWORD_MESSAGE, type AuthResult } from "../../api/auth";
import { CONTACT } from "../../data/contact";
import { usePasswordStrength } from "../../hooks/usePasswordStrength";
import { SESSION_KEY } from "../../hooks/useSession";
import { BrandLogo } from "../ui/BrandLogo";
import { buttonClassName } from "../ui/buttonStyles";
import { inputClassName } from "../ui/inputStyles";
import { PasswordInput } from "../ui/PasswordInput";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

export type AuthMode = "sign-in" | "register" | "forgot";

const TITLES: Record<AuthMode, string> = {
  "sign-in": "Sign in to Kestlow",
  register: "Create your account",
  forgot: "Forgot your password?",
};

interface AuthScreenProps {
  initialMode?: AuthMode;
}

/**
 * What signed-out people see (KES-23): sign in, create an account, or get help with a forgotten
 * password. Switching between them moves focus to the new heading.
 */
export function AuthScreen({ initialMode = "sign-in" }: AuthScreenProps) {
  const api = useAuthApi();
  const queryClient = useQueryClient();
  const id = useId();
  const [mode, setMode] = useState(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const switched = useRef(false);
  // Kept as they're typed only for the strength meter, which counts the person's own name and
  // email as easy to guess; the form itself is read on submit.
  const [details, setDetails] = useState({ name: "", email: "", password: "" });
  // Hidden again on every submit and screen switch, so a password isn't left on show.
  const [showPassword, setShowPassword] = useState(false);
  const strength = usePasswordStrength(mode === "register" ? details.password : "", [
    details.name,
    details.email,
  ]);

  useEffect(() => {
    document.title = `${TITLES[mode]} – Kestlow`;
    // Only after a switch: on first load the page starts at the top as usual.
    if (switched.current) heading.current?.focus();
  }, [mode]);

  function switchTo(next: AuthMode) {
    switched.current = true;
    setError(null);
    setShowPassword(false);
    setMode(next);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowPassword(false);
    const form = new FormData(event.currentTarget);
    const text = (name: string) => {
      const value = form.get(name);
      return typeof value === "string" ? value : "";
    };
    const name = text("name").trim();
    if (mode === "register" && !name) return setError("Enter your name.");
    if (mode === "register") {
      // Only strong passwords are accepted; the API checks too, this saves the round trip. If the
      // checker can't load (a bad signal, or a new deploy replaced it), the API's check is enough.
      const checker = await import("../../logic/password").catch(() => null);
      const password = text("password");
      if (
        checker &&
        password.length >= 8 &&
        checker.checkPassword(password, [name, text("email")]).strength !== "strong"
      )
        return setError(WEAK_PASSWORD_MESSAGE);
    }

    setSending(true);
    setError(null);
    let result: AuthResult;
    try {
      result =
        mode === "register"
          ? await api.register({ name, email: text("email"), password: text("password") })
          : await api.signIn({ email: text("email"), password: text("password") });
    } catch {
      result = { ok: false, message: "We couldn't reach Kestlow. Please try again in a minute." };
    }
    setSending(false);
    if (result.ok) await queryClient.invalidateQueries({ queryKey: SESSION_KEY });
    else setError(result.message);
  }

  const switchButton = (next: AuthMode, label: string) => (
    <button
      type="button"
      onClick={() => switchTo(next)}
      className="inline-block py-1 font-semibold text-ink underline"
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen">
      <header className="brand-surface py-5 [--focus:#ffffff]">
        <div className="mx-auto max-w-md px-4">
          <BrandLogo />
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-10">
        <h1 ref={heading} tabIndex={-1} className="m-0 text-2xl font-bold">
          {TITLES[mode]}
        </h1>

        {mode === "forgot" ? (
          <div className="mt-4">
            <p className="m-0 text-muted">
              Password resets are on their way. Until then, email{" "}
              <a href={`mailto:${CONTACT.support}`} className="font-semibold text-ink underline">
                {CONTACT.support}
              </a>{" "}
              from the address you signed up with, and we'll help you back in.
            </p>
            <p className="mt-6 mb-0">{switchButton("sign-in", "Back to sign in")}</p>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={(event) => void submit(event)}
            className="mt-6 flex flex-col gap-5 rounded-card bg-card p-5 shadow-card"
          >
            {mode === "register" && (
              <div>
                <label htmlFor={`${id}-name`} className="block font-bold">
                  Your name
                </label>
                <input
                  id={`${id}-name`}
                  name="name"
                  type="text"
                  autoComplete="name"
                  onChange={(event) => setDetails({ ...details, name: event.target.value })}
                  className={inputClassName()}
                />
              </div>
            )}

            <div>
              <label htmlFor={`${id}-email`} className="block font-bold">
                Email address
              </label>
              <input
                id={`${id}-email`}
                name="email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                onChange={(event) => setDetails({ ...details, email: event.target.value })}
                className={inputClassName()}
              />
            </div>

            <div>
              <label htmlFor={`${id}-password`} className="block font-bold">
                Password
              </label>
              {mode === "register" && (
                <p id={`${id}-password-hint`} className="mt-0.5 mb-0 text-sm text-muted">
                  At least 8 characters, and it must reach Strong. Three random words, like
                  ladder-teapot-rain, work well.
                </p>
              )}
              <PasswordInput
                id={`${id}-password`}
                name="password"
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                aria-describedby={mode === "register" ? `${id}-password-hint` : undefined}
                onChange={(event) => setDetails({ ...details, password: event.target.value })}
                shown={showPassword}
                onShownChange={setShowPassword}
              />
              {mode === "register" && <PasswordStrengthMeter check={strength} />}
              {mode === "sign-in" && (
                <p className="mt-1 mb-0">{switchButton("forgot", "Forgot your password?")}</p>
              )}
            </div>

            <div>
              {/* Always on the page and two lines tall, so a message appearing doesn't push the
                  button down, and screen readers reliably announce it. */}
              <p role="alert" className="-mt-2 mb-1 min-h-[2lh] text-sm font-semibold text-error">
                {error}
              </p>
              <button
                type="submit"
                disabled={sending}
                className={buttonClassName("primary", "w-full flex-none disabled:opacity-70")}
              >
                {sending
                  ? mode === "register"
                    ? "Creating your account…"
                    : "Signing in…"
                  : mode === "register"
                    ? "Create account"
                    : "Sign in"}
              </button>
            </div>
          </form>
        )}

        {mode === "sign-in" && (
          <p className="mt-6 mb-0">
            New to Kestlow? {switchButton("register", "Create an account")}
          </p>
        )}
        {mode === "register" && (
          <p className="mt-6 mb-0">Already have an account? {switchButton("sign-in", "Sign in")}</p>
        )}
      </main>
    </div>
  );
}
