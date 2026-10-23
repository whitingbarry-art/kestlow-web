import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
}

export function Card({ selected = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "mx-4 my-3 rounded-card border-2 bg-card p-4 shadow-card",
        selected ? "border-selected" : "border-transparent",
        className,
      )}
      {...props}
    />
  );
}
