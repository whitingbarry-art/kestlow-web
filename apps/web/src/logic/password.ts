import { ZxcvbnFactory } from "@zxcvbn-ts/core";
import * as common from "@zxcvbn-ts/language-common";
import * as en from "@zxcvbn-ts/language-en";

// The same check as the API's (kestlow-api apps/api/src/password.ts), so the meter agrees with
// what the API accepts. This module is about 1 MB of dictionaries, so it's loaded only when
// someone starts choosing a password (usePasswordStrength).

export type PasswordStrength = "weak" | "medium" | "strong";

export interface PasswordCheck {
  strength: PasswordStrength;
  /** Why it's weak, or what would make it stronger; null when there's nothing to add. */
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

/** How hard a password is to guess, judged the way attackers guess, with a tip to improve it. */
export function checkPassword(password: string, userInputs: string[] = []): PasswordCheck {
  const { score, feedback } = zxcvbn.check(password, personalWords(userInputs));
  const strength = score <= 1 ? "weak" : score === 2 ? "medium" : "strong";
  const tip = strength === "strong" ? null : (feedback.warning ?? feedback.suggestions[0] ?? null);
  return { strength, tip };
}
