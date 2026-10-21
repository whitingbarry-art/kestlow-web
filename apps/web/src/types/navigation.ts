export type View = "leads" | "saved" | "alerts";

export interface NavItem {
  view: View;
  label: string;
  icon: string;
}
