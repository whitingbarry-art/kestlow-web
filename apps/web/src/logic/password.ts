import { ZxcvbnFactory } from "@zxcvbn-ts/core";
import * as common from "@zxcvbn-ts/language-common";
import * as en from "@zxcvbn-ts/language-en";

// The same check as the API's (kestlow-api apps/api/src/password.ts), so the meter agrees with
// what the API accepts. This module is about 1 MB of dictionaries, so it's loaded only when
// someone starts choosing a password (usePasswordStrength).

export type PasswordStrength = "weak" | "good" | "strong";

/** The shortest password Better Auth accepts. */
export const MIN_PASSWORD_LENGTH = 8;

/** What the checklist under the password ticks off (KES-167). */
export interface PasswordRules {
  /** At least MIN_PASSWORD_LENGTH characters. */
  long: boolean;
  /** Doesn't contain their own email address (or name, for older accounts that gave one). */
  notPersonal: boolean;
  /** Not a common password, word or keyboard pattern: Good or Strong. */
  hardToGuess: boolean;
}

export interface PasswordCheck {
  strength: PasswordStrength;
  rules: PasswordRules;
  /** Why it's weak, or how to make it stronger; null when there's nothing to add. */
  tip: string | null;
}

const zxcvbn = new ZxcvbnFactory({
  dictionary: { ...common.dictionary, ...en.dictionary },
  graphs: common.adjacencyGraphs,
  translations: en.translations,
});

/** zxcvbn only matches whole entries, so names and emails are split into their words. */
function personalWords(inputs: string[]): string[] {
  return inputs.flatMap((input) => {
    const lower = input.toLowerCase();
    const local = lower.split("@")[0];
    const parts = lower.split(/[^a-z0-9]+/).filter((part) => part.length > 1);
    return [lower, local, parts.join(""), ...parts];
  });
}

/** Weak is refused; Good and Strong are accepted (KES-167). */
export const isAcceptable = (strength: PasswordStrength) => strength !== "weak";

/** How hard a password is to guess, judged the way attackers guess, with a tip to improve it. */
export function checkPassword(password: string, userInputs: string[] = []): PasswordCheck {
  const { score, feedback, sequence } = zxcvbn.check(password, personalWords(userInputs));
  const strength = score <= 1 ? "weak" : score === 2 ? "good" : "strong";
  const rules: PasswordRules = {
    long: password.length >= MIN_PASSWORD_LENGTH,
    notPersonal: !sequence.some(
      (match) => "dictionaryName" in match && match.dictionaryName === "userInputs",
    ),
    hardToGuess: isAcceptable(strength),
  };
  // zxcvbn's own words for a name or email ("personal or page related data") are clumsy.
  const tip =
    strength === "weak"
      ? !rules.notPersonal
        ? "Leave out your email address."
        : (feedback.warning ?? feedback.suggestions[0] ?? "Add another word or two.")
      : strength === "good"
        ? "That will do. Another word would make it Strong."
        : null;
  return { strength, rules, tip };
}
