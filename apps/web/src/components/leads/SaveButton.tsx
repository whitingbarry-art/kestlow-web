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
      {saved ? "Saved ✓" : "Save"}
    </Button>
  );
}
