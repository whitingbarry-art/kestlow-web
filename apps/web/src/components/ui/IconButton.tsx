import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export function IconButton({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn("rounded-[10px] bg-white/12 px-2.5 py-2 text-base text-white", className)}
      {...props}
    />
  );
}
