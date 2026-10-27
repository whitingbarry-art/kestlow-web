import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useAuthApi } from "../../api/AuthApiContext";
import { WEAK_PASSWORD_MESSAGE, type AuthResult } from "../../api/auth";
import { DATA_CONTROLLER } from "../../data/waitlist";
import { usePasswordStrength } from "../../hooks/usePasswordStrength";
import { SESSION_KEY } from "../../hooks/useSession";
import { BrandLogo } from "../ui/BrandLogo";
import { buttonClassName } from "../ui/buttonStyles";
import { inputClassName } from "../ui/inputStyles";
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
    setMode(next);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => {
      const value = form.get(name);
      return typeof value === "string" ? value : "";
    };
    const name = text("name").trim();
    if (mode === "register" && !name) return setError("Enter your name.");
    if (mode === "register") {
      // The API refuses weak passwords too; checking here saves the round trip.
      const { checkPassword } = await import("../../logic/password");
      const password = text("password");
      if (
        password.length >= 8 &&
        checkPassword(password, [name, text("email")]).strength === "weak"
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
      <header className="bg-side py-5 [--focus:#ffffff]">
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
              <a
                href={`mailto:${DATA_CONTROLLER.email}`}
                className="font-semibold text-ink underline"
              >
                {DATA_CONTROLLER.email}
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
            {error && (
              <p role="alert" className="m-0 font-semibold text-error">
                {error}
              </p>
            )}

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
                  At least 8 characters. A few unrelated words together is strong and easy to
                  remember, like “ladder teapot rain”.
                </p>
              )}
              <input
                id={`${id}-password`}
                name="password"
                type="password"
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                aria-describedby={mode === "register" ? `${id}-password-hint` : undefined}
                onChange={(event) => setDetails({ ...details, password: event.target.value })}
                className={inputClassName()}
              />
              {mode === "register" && <PasswordStrengthMeter check={strength} />}
              {mode === "sign-in" && (
                <p className="mt-1 mb-0">{switchButton("forgot", "Forgot your password?")}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={sending}
              className={buttonClassName("primary", "flex-none disabled:opacity-70")}
            >
              {sending
                ? mode === "register"
                  ? "Creating your account…"
                  : "Signing in…"
                : mode === "register"
                  ? "Create account"
                  : "Sign in"}
            </button>
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
