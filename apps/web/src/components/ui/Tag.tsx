import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface TagProps {
  match?: boolean;
  children: ReactNode;
}

export function Tag({ match = false, children }: TagProps) {
  return (
    <span
      className={cn(
        "rounded-lg px-2.5 py-1 text-xs font-semibold",
        match ? "bg-match-bg text-match-text" : "bg-chip text-ink",
      )}
    >
      {children}
    </span>
  );
}
