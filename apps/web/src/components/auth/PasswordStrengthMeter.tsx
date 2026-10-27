import type { PasswordCheck } from "../../logic/password";
import { cn } from "../../utils/cn";

const LEVELS = { weak: 1, medium: 2, strong: 3 } as const;
const LABELS = { weak: "Weak", medium: "Medium", strong: "Strong" } as const;
const COLOURS = { weak: "bg-error", medium: "bg-selected", strong: "bg-match-text" } as const;

interface PasswordStrengthMeterProps {
  /** Null while there's nothing to judge yet. */
  check: PasswordCheck | null;
}

/** Three bars and a word, plus a tip; the words carry the meaning, so colour isn't needed. */
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
    </div>
  );
}
