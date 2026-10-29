import { Bell, Bookmark, ClipboardList, UserRound } from "lucide-react";
import type { NavItem } from "../types/navigation";

export const NAV_ITEMS: NavItem[] = [
  { view: "leads", label: "Leads", icon: ClipboardList },
  { view: "saved", label: "Saved", icon: Bookmark },
  { view: "alerts", label: "Alerts", icon: Bell },
  { view: "account", label: "Account", icon: UserRound },
];

/** The pages anyone can read, signed in or not (KES-116, KES-37). */
export const SITE_LINKS = [
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact us" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/refunds", label: "Refunds" },
] as const;
