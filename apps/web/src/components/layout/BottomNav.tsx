import type { NavItem, View } from "../../types/navigation";
import { cn } from "../../utils/cn";

interface BottomNavProps {
  items: NavItem[];
  activeView: View;
  onNavigate: (view: View) => void;
  inert?: boolean;
}

export function BottomNav({ items, activeView, onNavigate, inert = false }: BottomNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-card desk:hidden"
      aria-label="Main"
      inert={inert}
    >
      <div className="mx-auto flex max-w-[520px]">
        {items.map((item) => {
          const active = item.view === activeView;
          return (
            <button
              key={item.view}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onNavigate(item.view)}
              className={cn(
                "flex-1 border-t-[3px] pt-2 pb-3 text-xs font-semibold",
                active ? "border-ink text-ink" : "border-transparent text-muted",
              )}
            >
              {/* The darker amber (--selected) keeps the active icon at 3:1 on the white bar. */}
              <item.icon
                size={22}
                strokeWidth={2}
                className={cn("mx-auto mb-0.5 block", active && "text-selected")}
              />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
