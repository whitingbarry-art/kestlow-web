import { useCallback, useEffect, useRef, useState, type ComponentProps } from "react";
import { cn } from "../../utils/cn";

type Side = "left" | "right";

/** How long after the last scroll event the row counts as still. */
const SETTLE_MS = 250;

/**
 * An amber triangle pointing `side`: outlined while the row is still, filled while it moves or
 * the pointer is over it, so it's clear it does something.
 */
function Triangle({ side, filled }: { side: Side; filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="size-5 text-selected">
      <polygon
        points={side === "left" ? "14,3 14,17 4,10" : "6,3 6,17 16,10"}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        className={cn(
          "transition-colors",
          filled ? "fill-current" : "fill-transparent group-hover:fill-current",
        )}
      />
    </svg>
  );
}

/**
 * A row that scrolls sideways with no scroll bar (KES-119): an amber triangle shows on a soft fade
 * at whichever end has more to see, and glides the row along. Swiping and Tab still work, so the
 * arrows are extra help for a mouse, hidden from screen readers and the keyboard.
 */
export function ScrollRow({ className, children, ...props }: ComponentProps<"div">) {
  const row = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState({ left: false, right: false });
  const [moving, setMoving] = useState(false);
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const update = useCallback(() => {
    const el = row.current;
    if (!el) return;
    // A pixel's slack, as zoomed pages report fractional widths.
    setMore({
      left: el.scrollLeft > 1,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    });
  }, []);

  useEffect(() => {
    const el = row.current;
    if (!el) return;
    update();
    const scrolled = () => {
      update();
      setMoving(true);
      clearTimeout(settle.current);
      settle.current = setTimeout(() => setMoving(false), SETTLE_MS);
    };
    el.addEventListener("scroll", scrolled, { passive: true });
    const resized = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(update);
    resized?.observe(el);
    return () => {
      el.removeEventListener("scroll", scrolled);
      resized?.disconnect();
      clearTimeout(settle.current);
    };
  }, [update]);

  const glide = (side: Side) => {
    const el = row.current;
    if (!el) return;
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: (side === "left" ? -1 : 1) * el.clientWidth * 0.7,
      behavior: still ? "auto" : "smooth",
    });
  };

  return (
    <div className="relative">
      <div ref={row} className={cn("no-scrollbar overflow-x-auto", className)} {...props}>
        {children}
      </div>
      {(["left", "right"] as const).map(
        (side) =>
          more[side] && (
            <div
              key={side}
              aria-hidden="true"
              className={cn(
                "absolute inset-y-0 flex w-14 items-center",
                side === "left"
                  ? "left-0 justify-start bg-linear-to-r from-page from-40% to-transparent pl-1.5"
                  : "right-0 justify-end bg-linear-to-l from-page from-40% to-transparent pr-1.5",
              )}
            >
              <button
                type="button"
                tabIndex={-1}
                onClick={() => glide(side)}
                data-testid={`scroll-${side}`}
                data-moving={moving || undefined}
                className="group grid size-8 place-items-center"
              >
                <Triangle side={side} filled={moving} />
              </button>
            </div>
          ),
      )}
    </div>
  );
}
