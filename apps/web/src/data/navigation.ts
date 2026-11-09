import {
  Accessibility,
  Bell,
  Bookmark,
  ClipboardList,
  FileText,
  Info,
  Mail,
  RotateCcw,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { NavItem } from "../types/navigation";
import { JOBS_PATH } from "./jobs";

export const NAV_ITEMS: NavItem[] = [
  { view: "leads", label: "Leads", icon: ClipboardList },
  { view: "saved", label: "Saved", icon: Bookmark },
  { view: "alerts", label: "Alerts", icon: Bell },
  { view: "account", label: "Account", icon: UserRound },
];

/** The pages anyone can read, signed in or not (KES-116, KES-37, KES-132, KES-155). */
export const SITE_LINKS = [
  { href: JOBS_PATH, label: "Jobs near you", icon: Search },
  { href: "/about", label: "About us", icon: Info },
  { href: "/contact", label: "Contact us", icon: Mail },
  { href: "/accessibility", label: "Accessibility", icon: Accessibility },
  { href: "/terms", label: "Terms", icon: FileText },
  { href: "/privacy", label: "Privacy", icon: ShieldCheck },
  { href: "/refunds", label: "Refunds", icon: RotateCcw },
] as const;
