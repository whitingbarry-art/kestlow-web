import { Check } from "lucide-react";
import type { MouseEvent } from "react";
import { Button } from "../ui/Button";

interface SaveButtonProps {
  saved: boolean;
  onToggle: () => void;
}

export function SaveButton({ saved, onToggle }: SaveButtonProps) {
  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();
    onToggle();
  };

  return (
    <Button variant="ghost" aria-pressed={saved} onClick={handleClick}>
      {saved ? (
        <>
          <span className="inline-flex items-center gap-1.5">
            Saved <Check size={18} strokeWidth={2.5} />
          </span>
        </>
      ) : (
        "Save"
      )}
    </Button>
  );
}
