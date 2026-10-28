import { cn } from "../../utils/cn";

export type ButtonVariant = "primary" | "ghost" | "danger" | "danger-ghost";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-amber text-navy",
  ghost: "bg-chip text-ink",
  // For things that can't be undone, such as deleting an account.
  danger: "bg-error text-card",
  "danger-ghost": "bg-chip text-error",
};

/** Button styling, shared with links that look like buttons. */
export function buttonClassName(variant: ButtonVariant = "primary", className?: string): string {
  return cn(
    "flex-1 rounded-xl p-3 text-center text-[15px] font-bold",
    VARIANT_CLASSES[variant],
    className,
  );
}
