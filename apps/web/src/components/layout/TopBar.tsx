import { SunMoon } from "lucide-react";
import { BrandLogo } from "../ui/BrandLogo";
import { IconButton } from "../ui/IconButton";

interface TopBarProps {
  onToggleTheme: () => void;
  onSignOut: () => void;
}

export function TopBar({ onToggleTheme, onSignOut }: TopBarProps) {
  return (
    <header className="sticky top-0 z-5 flex items-center justify-between brand-surface px-4 py-3.5 [--focus:#fff] desk:hidden">
      <BrandLogo size={34} />
      <div className="flex items-center gap-2.5">
        <IconButton aria-label="Switch light or dark" onClick={onToggleTheme}>
          <SunMoon size={20} />
        </IconButton>
        <IconButton onClick={onSignOut} className="text-sm font-semibold">
          Sign out
        </IconButton>
      </div>
    </header>
  );
}
