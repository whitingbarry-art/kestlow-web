import { cn } from "../../utils/cn";

interface ChipProps {
  label: string;
  active: boolean;
  onSelect: () => void;
}

export function Chip({ label, active, onSelect }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={cn(
        "whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-semibold",
        active
          ? "border-navy bg-navy text-white dark:border-amber dark:bg-amber dark:text-navy"
          : "border-line bg-card text-muted",
      )}
    >
      {label}
    </button>
  );
}
