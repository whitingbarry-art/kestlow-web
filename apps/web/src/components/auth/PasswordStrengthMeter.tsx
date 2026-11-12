import { Check, Minus } from "lucide-react";
import type { PasswordCheck, PasswordRules } from "../../logic/password";
import { cn } from "../../utils/cn";

const LEVELS = { weak: 1, good: 2, strong: 3 } as const;
const LABELS = { weak: "Weak", good: "Good", strong: "Strong" } as const;
const COLOURS = { weak: "bg-error", good: "bg-match-text", strong: "bg-match-text" } as const;

/** What a password needs, in the order the checklist shows it (KES-167). */
const RULES: { rule: keyof PasswordRules; label: string }[] = [
  { rule: "long", label: "At least 8 characters" },
  { rule: "notPersonal", label: "Doesn't use your name or email" },
  { rule: "hardToGuess", label: "Not a common password, word or pattern" },
];

interface PasswordStrengthMeterProps {
  /** Null while there's nothing to judge yet. */
  check: PasswordCheck | null;
}

/**
 * Three bars and a word, a tip, and a checklist with a green tick for each rule met and a dash
 * for each not yet. The words carry the meaning, so colour isn't needed.
 */
export function PasswordStrengthMeter({ check }: PasswordStrengthMeterProps) {
  const filled = check ? LEVELS[check.strength] : 0;

  return (
    <div className="mt-2">
      <div aria-hidden="true" className="flex gap-1.5">
        {[1, 2, 3].map((level) => (
          <span
            key={level}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              check && level <= filled ? COLOURS[check.strength] : "bg-line",
            )}
          />
        ))}
      </div>
      <p aria-live="polite" className="mt-1 mb-0 min-h-[2lh] text-sm">
        {check && (
          <>
            <b>Strength: {LABELS[check.strength]}.</b>
            {check.tip && <span className="text-muted"> {check.tip}</span>}
          </>
        )}
      </p>
      <ul aria-label="Your password needs" className="m-0 mt-1 list-none space-y-1 p-0 text-sm">
        {RULES.map(({ rule, label }) => {
          const met = check?.rules[rule] ?? false;
          const Icon = met ? Check : Minus;
          return (
            <li
              key={rule}
              className={cn("flex items-center gap-2", met ? "text-match-text" : "text-muted")}
            >
              <Icon size={16} strokeWidth={met ? 3 : 2} aria-hidden="true" className="shrink-0" />
              <span>
                <span className="sr-only">{met ? "Done: " : "Not yet: "}</span>
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
