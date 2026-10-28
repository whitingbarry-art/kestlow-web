import type { LucideIcon } from "lucide-react";

export type View = "leads" | "saved" | "alerts";

export interface NavItem {
  view: View;
  label: string;
  /** An SVG icon from Lucide, sharp at any zoom; hidden from screen readers, as the label says it. */
  icon: LucideIcon;
}
