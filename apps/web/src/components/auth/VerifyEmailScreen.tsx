import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useAuthApi } from "../../api/AuthApiContext";
import type { AuthResult } from "../../api/auth";
import { SESSION_KEY } from "../../hooks/useSession";
import { buttonClassName } from "../ui/buttonStyles";
import { AuthLayout } from "./AuthLayout";

interface VerifyEmailScreenProps {
  /** From the emailed link's ?token=; null when the link was cut short. */
  token: string | null;
}

/** Where a confirmation email's link opens (KES-40): confirms the address straight away. */
export function VerifyEmailScreen({ token }: VerifyEmailScreenProps) {
  const api = useAuthApi();
  const queryClient = useQueryClient();
  const [result, setResult] = useState<AuthResult | null>(
    token ? null : { ok: false, message: "This link isn't complete. Try copying the whole link." },
  );
  const asked = useRef(false);

  useEffect(() => {
    document.title = "Confirm your email – Kestlow";
    // Once, even in React's development double run: a used token can't be used again.
    if (!token || asked.current) return;
    asked.current = true;
    void api
      .verifyEmail(token)
      .catch(
        () => ({ ok: false, message: "We couldn't reach Kestlow. Please try again." }) as const,
      )
      .then((outcome) => {
        setResult(outcome);
        // A signed-in person's session now says they're confirmed.
        if (outcome.ok) void queryClient.invalidateQueries({ queryKey: SESSION_KEY });
      });
  }, [api, queryClient, token]);

  return (
    <AuthLayout>
      <h1 className="m-0 text-2xl font-bold">
        {result === null
          ? "Confirming your email…"
          : result.ok
            ? "Email confirmed"
            : "That didn't work"}
      </h1>
      <p role="status" className="mt-3 text-muted">
        {result === null
          ? "Just a moment."
          : result.ok
            ? "Thanks. Lead alerts can reach you now."
            : `${result.message} You can send a new one from Kestlow once you're signed in.`}
      </p>
      {result !== null && (
        <a href="/" className={buttonClassName("primary", "mt-4 block w-full")}>
          Go to Kestlow
        </a>
      )}
    </AuthLayout>
  );
}
