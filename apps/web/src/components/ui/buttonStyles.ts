import { cn } from "../../utils/cn";

export type ButtonVariant = "primary" | "ghost";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-amber text-navy",
  ghost: "bg-chip text-ink",
};

/** Button styling, shared with links that look like buttons. */
export function buttonClassName(variant: ButtonVariant = "primary", className?: string): string {
  return cn(
    "flex-1 rounded-xl p-3 text-center text-[15px] font-bold",
    VARIANT_CLASSES[variant],
    className,
  );
}
