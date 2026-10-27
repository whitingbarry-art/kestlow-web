import { Bell, Bookmark, ClipboardList } from "lucide-react";
import type { NavItem } from "../types/navigation";

export const NAV_ITEMS: NavItem[] = [
  { view: "leads", label: "Leads", icon: ClipboardList },
  { view: "saved", label: "Saved", icon: Bookmark },
  { view: "alerts", label: "Alerts", icon: Bell },
];
