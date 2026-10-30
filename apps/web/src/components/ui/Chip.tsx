import { Lock } from "lucide-react";
import { cn } from "../../utils/cn";

interface ChipProps {
  label: string;
  active: boolean;
  onSelect: () => void;
  /** Not on their plan (KES-52): greyed, with a padlock, and selecting it explains why. */
  locked?: boolean;
}

export function Chip({ label, active, onSelect, locked = false }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={locked ? undefined : active}
      onClick={onSelect}
      className={cn(
        // Relative, so the hidden "(not on your plan)" stays inside the scrolling row rather than
        // widening the page.
        "relative flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-semibold",
        locked
          ? "border-dashed border-line bg-transparent text-muted"
          : active
            ? "border-navy bg-navy text-white dark:border-amber dark:bg-amber dark:text-navy"
            : "border-line bg-card text-muted",
      )}
    >
      {locked && <Lock size={14} strokeWidth={2.5} aria-hidden="true" />}
      {label}
      {locked && <span className="sr-only"> (not on your plan)</span>}
    </button>
  );
}
