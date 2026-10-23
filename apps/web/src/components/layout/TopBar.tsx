import { BrandLogo } from "../ui/BrandLogo";
import { IconButton } from "../ui/IconButton";

interface TopBarProps {
  onToggleTheme: () => void;
}

export function TopBar({ onToggleTheme }: TopBarProps) {
  return (
    <header className="sticky top-0 z-5 flex items-center justify-between bg-side px-4 py-3.5 [--focus:#fff] desk:hidden">
      <BrandLogo size={34} />
      <div className="flex items-center gap-2.5">
        <IconButton aria-label="Switch light or dark" onClick={onToggleTheme}>
          &#9680;
        </IconButton>
      </div>
    </header>
  );
}
