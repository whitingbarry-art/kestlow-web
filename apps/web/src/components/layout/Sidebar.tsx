import type { NavItem, View } from "../../types/navigation";
import { cn } from "../../utils/cn";
import { BrandLogo } from "../ui/BrandLogo";

interface SidebarProps {
  items: NavItem[];
  activeView: View;
  onNavigate: (view: View) => void;
  onToggleTheme: () => void;
  onSignOut: () => void;
  /** The signed-in user's name, shown above Sign out. */
  userName: string;
}

const LINK_CLASSES = "rounded-xl px-3.5 py-3 text-left text-[15px] font-semibold";

export function Sidebar({
  items,
  activeView,
  onNavigate,
  onToggleTheme,
  onSignOut,
  userName,
}: SidebarProps) {
  return (
    <aside className="hidden flex-col gap-1.5 brand-surface px-4 py-[22px] text-white [--focus:#fff] desk:flex">
      <div className="mb-[22px] px-2">
        <BrandLogo />
      </div>
      <nav className="flex flex-col gap-1.5" aria-label="Main">
        {items.map((item) => {
          const active = item.view === activeView;
          return (
            <button
              key={item.view}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onNavigate(item.view)}
              className={cn(
                LINK_CLASSES,
                active
                  ? "bg-white/14 text-white shadow-[inset_3px_0_0_var(--color-amber)]"
                  : "text-side-link hover:bg-white/8",
              )}
            >
              <span aria-hidden="true">{item.icon}&nbsp; </span>
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="flex-1" />
      <button
        type="button"
        onClick={onToggleTheme}
        className={cn(LINK_CLASSES, "bg-white/10 text-center text-white")}
      >
        Switch light / dark
      </button>
      <p className="mt-2 mb-0 px-3.5 text-sm text-side-link">
        Signed in as <b className="font-semibold text-white">{userName}</b>
      </p>
      <button
        type="button"
        onClick={onSignOut}
        className={cn(LINK_CLASSES, "text-center text-side-link hover:bg-white/8")}
      >
        Sign out
      </button>
    </aside>
  );
}
