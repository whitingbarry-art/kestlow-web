import { useEffect, useState } from "react";
import type { PasswordCheck } from "../logic/password";

const WAIT_MS = 250;

/**
 * Checks `password` a moment after typing stops, so screen readers hear the result once rather
 * than on every key. Null while it's empty, or until the latest password has been checked.
 */
export function usePasswordStrength(password: string, userInputs: string[]): PasswordCheck | null {
  // Each result remembers the password it was for, so a stale one is never shown.
  const [result, setResult] = useState<{ password: string; check: PasswordCheck } | null>(null);
  const inputs = userInputs.join("\n");

  useEffect(() => {
    if (!password) return;
    let current = true;
    const timer = setTimeout(() => {
      // No meter if the checker can't load; registering still works, as the API checks too.
      void import("../logic/password")
        .then(({ checkPassword }) => {
          if (current) setResult({ password, check: checkPassword(password, inputs.split("\n")) });
        })
        .catch(() => undefined);
    }, WAIT_MS);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [password, inputs]);

  return password && result?.password === password ? result.check : null;
}
