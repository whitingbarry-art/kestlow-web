import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { IconButton } from "../ui/IconButton";

interface DetailPanelProps {
  open: boolean;
  onBack: () => void;
  children: ReactNode;
}

export function DetailPanel({ open, onBack, children }: DetailPanelProps) {
  return (
    <section
      aria-live="polite"
      aria-label="Lead details"
      className={cn(
        "fixed inset-0 z-20 overflow-y-auto bg-page transition-transform duration-250",
        open ? "translate-x-0" : "translate-x-full",
        "desk:static desk:z-auto desk:translate-x-0",
      )}
    >
      <div className="sticky top-0 flex items-center gap-3 bg-side px-4 py-3.5 text-white desk:hidden">
        <IconButton aria-label="Back" onClick={onBack}>
          &larr;
        </IconButton>
        <b>Lead details</b>
      </div>
      <div className="mx-auto max-w-[520px] p-4 desk:max-w-none desk:p-7">{children}</div>
    </section>
  );
}
