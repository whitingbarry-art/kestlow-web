import {
  Bell,
  Bookmark,
  ClipboardList,
  FileText,
  Info,
  Mail,
  RotateCcw,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { NavItem } from "../types/navigation";

export const NAV_ITEMS: NavItem[] = [
  { view: "leads", label: "Leads", icon: ClipboardList },
  { view: "saved", label: "Saved", icon: Bookmark },
  { view: "alerts", label: "Alerts", icon: Bell },
  { view: "account", label: "Account", icon: UserRound },
];

/** The pages anyone can read, signed in or not (KES-116, KES-37). */
export const SITE_LINKS = [
  { href: "/about", label: "About us", icon: Info },
  { href: "/contact", label: "Contact us", icon: Mail },
  { href: "/terms", label: "Terms", icon: FileText },
  { href: "/privacy", label: "Privacy", icon: ShieldCheck },
  { href: "/refunds", label: "Refunds", icon: RotateCcw },
] as const;
