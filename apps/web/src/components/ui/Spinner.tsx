import { LoaderCircle } from "lucide-react";

/**
 * A small turning circle for a button that's working (KES-167). Decorative: the button's words
 * say what's happening, and with reduced motion it simply stays still.
 */
export function Spinner() {
  return (
    <LoaderCircle
      size={18}
      aria-hidden="true"
      className="mr-2 inline-block animate-spin align-[-3px]"
    />
  );
}
