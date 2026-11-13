import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useAuthApi } from "../../api/AuthApiContext";
import { PASSWORD_HINT, WEAK_PASSWORD_MESSAGE, type AuthResult } from "../../api/auth";
import { pageTitle } from "../../data/site";
import { usePasswordStrength } from "../../hooks/usePasswordStrength";
import { SESSION_KEY } from "../../hooks/useSession";
import {
  recordStep as defaultRecordStep,
  reasonFromCode,
  type RecordStep,
} from "../../logic/funnel";
import { openedToSignUp, sourceFrom, withoutSignUp } from "../../logic/signUp";
import { buttonClassName } from "../ui/buttonStyles";
import { Spinner } from "../ui/Spinner";
import { inputClassName } from "../ui/inputStyles";
import { PasswordInput } from "../ui/PasswordInput";
import { AuthLayout } from "./AuthLayout";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

export type AuthMode = "sign-in" | "register" | "forgot";

const TITLES: Record<AuthMode, string> = {
  "sign-in": "Sign in to Kestlow",
  register: "Create your account",
  forgot: "Forgot your password?",
};

interface AuthScreenProps {
  initialMode?: AuthMode;
  /** Counts the sign-up steps (KES-130); tests pass a spy. */
  recordStep?: RecordStep;
}

/**
 * What signed-out people see (KES-23): sign in, create an account, or get help with a forgotten
 * password. Switching between them moves focus to the new heading.
 */
export function AuthScreen({
  initialMode = "sign-in",
  recordStep = defaultRecordStep,
}: AuthScreenProps) {
  const api = useAuthApi();
  const queryClient = useQueryClient();
  const id = useId();
  // "Ask for a new link" on an expired reset page opens straight at Forgot your password, and the
  // launch page's buttons at Create your account (KES-125).
  const [mode, setMode] = useState<AuthMode>(() =>
    initialMode !== "sign-in"
      ? initialMode
      : new URLSearchParams(window.location.search).has("forgot")
        ? "forgot"
        : openedToSignUp(window.location.search)
          ? "register"
          : initialMode,
  );
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const busy = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const switched = useRef(false);
  // Kept as they're typed only for the strength meter, which counts the person's own email as
  // easy to guess; the form itself is read on submit. No name: we don't need one (KES-169).
  const [details, setDetails] = useState({ email: "", password: "" });
  // Hidden again on every submit and screen switch, so a password isn't left on show.
  const [showPassword, setShowPassword] = useState(false);
  const strength = usePasswordStrength(mode === "register" ? details.password : "", [
    details.email,
  ]);

  // Where people who came to create an account get to, and why they don't (KES-130).
  const source = sourceFrom(window.location.search);
  const refused = (reason: string) => recordStep("register_refused", { source, reason });
  useEffect(() => {
    if (mode === "register") recordStep("register_viewed", { source });
  }, [mode, recordStep, source]);

  useEffect(() => {
    document.title = pageTitle(TITLES[mode]);
    // Only after a switch: on first load the page starts at the top as usual.
    if (switched.current) heading.current?.focus();
  }, [mode]);

  function switchTo(next: AuthMode) {
    switched.current = true;
    setError(null);
    setShowPassword(false);
    setMode(next);
  }

  // The button is off from the first tap until the answer comes back, including the moment the
  // password checker takes to load, so a second tap can't send it twice (KES-167).
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setSending(true);
    setShowPassword(false);
    try {
      await send(new FormData(event.currentTarget));
    } finally {
      busy.current = false;
      setSending(false);
    }
  }

  async function send(form: FormData) {
    const text = (name: string) => {
      const value = form.get(name);
      return typeof value === "string" ? value : "";
    };
    if (mode === "register") recordStep("register_tried", { source });
    // Caught here, as the name used to be, so an empty form gets an answer at once (KES-169).
    if (mode === "register" && !text("email").trim()) {
      refused("email-missing");
      return setError("Enter your email address.");
    }
    if (mode === "register") {
      // Weak passwords are refused (KES-167); the API checks too, this saves the round trip. If the
      // checker can't load (a bad signal, or a new deploy replaced it), the API's check is enough.
      const checker = await import("../../logic/password").catch(() => null);
      const password = text("password");
      if (
        checker &&
        password.length >= 8 &&
        !checker.isAcceptable(checker.checkPassword(password, [text("email")]).strength)
      ) {
        refused("password-too-weak");
        return setError(WEAK_PASSWORD_MESSAGE);
      }
    }

    setError(null);
    let result: AuthResult;
    try {
      result =
        mode === "register"
          ? await api.register({
              email: text("email"),
              password: text("password"),
              source,
            })
          : await api.signIn({ email: text("email"), password: text("password") });
    } catch {
      result = { ok: false, message: "We couldn't reach Kestlow. Please try again in a minute." };
    }
    if (!result.ok) {
      if (mode === "register") refused(reasonFromCode(result.code));
      return setError(result.message);
    }
    // The launch page's ?start and ?ref have done their job (KES-125).
    window.history.replaceState(window.history.state, "", withoutSignUp(window.location.href));
    await queryClient.invalidateQueries({ queryKey: SESSION_KEY });
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
    <AuthLayout>
      <h1 ref={heading} tabIndex={-1} className="m-0 text-2xl font-bold">
        {TITLES[mode]}
      </h1>

      {mode === "forgot" ? (
        <div className="mt-4">
          <ForgotPasswordForm />
          <p className="mt-6 mb-0">{switchButton("sign-in", "Back to sign in")}</p>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={(event) => void submit(event)}
          className="mt-6 flex flex-col gap-5 rounded-card bg-card p-5 shadow-card"
        >
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
                {PASSWORD_HINT}
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
              {sending && <Spinner />}
              {sending
                ? mode === "register"
                  ? "Creating your account…"
                  : "Signing in…"
                : mode === "register"
                  ? "Create account"
                  : "Sign in"}
            </button>
            {mode === "register" && (
              <p className="mt-3 mb-0 text-sm text-muted">
                By creating an account you agree to our{" "}
                <a href="/terms" className="font-semibold text-ink underline">
                  terms of service
                </a>
                , and our{" "}
                <a href="/privacy" className="font-semibold text-ink underline">
                  privacy notice
                </a>{" "}
                explains how we use your details.
              </p>
            )}
          </div>
        </form>
      )}

      {mode === "sign-in" && (
        <p className="mt-6 mb-0">New to Kestlow? {switchButton("register", "Create an account")}</p>
      )}
      {mode === "register" && (
        <p className="mt-6 mb-0">Already have an account? {switchButton("sign-in", "Sign in")}</p>
      )}
    </AuthLayout>
  );
}
