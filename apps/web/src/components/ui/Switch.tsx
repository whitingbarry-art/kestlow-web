import { cn } from "../../utils/cn";

interface SwitchProps {
  checked: boolean;
  label: string;
  onToggle: () => void;
}

export function Switch({ checked, label, onToggle }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        "relative h-7 w-12 flex-none rounded-full transition-colors duration-200",
        checked ? "bg-green" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] size-[22px] rounded-full bg-white transition-all duration-200",
          checked ? "left-[23px]" : "left-[3px]",
        )}
      />
    </button>
  );
}
