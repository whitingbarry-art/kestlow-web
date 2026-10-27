import { cn } from "../../utils/cn";

/** Text input styling, shared by every form. The muted border keeps the edge at 3:1 contrast. */
export function inputClassName(invalid = false, className?: string): string {
  return cn(
    "mt-1.5 block w-full rounded-xl border-2 bg-card px-3 py-2.5 text-base text-ink",
    invalid ? "border-error" : "border-muted",
    className,
  );
}
