import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useIsDesktop } from "../../hooks/useMediaQuery";
import { cn } from "../../utils/cn";
import { IconButton } from "../ui/IconButton";

interface DetailPanelProps {
  open: boolean;
  /** Changes every time the user opens a lead, even the one already shown; focus moves into the panel each time. */
  focusKey?: number | null;
  onBack: () => void;
  children: ReactNode;
}

export function DetailPanel({ open, focusKey = null, onBack, children }: DetailPanelProps) {
  const isDesktop = useIsDesktop();
  const panelRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  // On mobile the closed panel sits off-screen, so keep it out of the tab order and accessibility tree.
  const hidden = !open && !isDesktop;

  useEffect(() => {
    if (focusKey === null) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && !panelRef.current?.contains(active)) {
      returnFocusRef.current = active;
    }
    panelRef.current?.focus();
  }, [focusKey]);

  const handleBack = useCallback(() => {
    onBack();
    returnFocusRef.current?.focus();
    returnFocusRef.current = null;
  }, [onBack]);

  useEffect(() => {
    if (!open || isDesktop) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleBack();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, isDesktop, handleBack]);

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      inert={hidden}
      aria-label="Lead details"
      className={cn(
        "fixed inset-0 z-20 overflow-y-auto bg-page transition-transform duration-250",
        open ? "translate-x-0" : "translate-x-full",
        "desk:static desk:z-auto desk:translate-x-0",
      )}
    >
      <div className="sticky top-0 flex items-center gap-3 bg-side px-4 py-3.5 text-white [--focus:#fff] desk:hidden">
        <IconButton aria-label="Back to leads" onClick={handleBack}>
          <span aria-hidden="true">&larr;</span>
        </IconButton>
        <b>Lead details</b>
      </div>
      <div className="mx-auto max-w-[520px] p-4 desk:max-w-none desk:p-7">{children}</div>
    </section>
  );
}
