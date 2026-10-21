import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type ButtonVariant = "primary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-amber text-navy",
  ghost: "bg-chip text-ink",
};

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "flex-1 rounded-xl p-3 text-center text-[15px] font-bold",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
}
