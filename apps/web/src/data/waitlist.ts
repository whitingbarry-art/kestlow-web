// The plans and prices, from the Architecture and Delivery Plan's "Pricing and billing" section,
// as the launch page and /pricing show them (KES-97, KES-125). Stripe holds the prices charged.

import { CONTACT } from "./contact";

/**
 * Who collects the waitlist's details and how to reach them, as UK GDPR requires. Change the name
 * once Kestlow is its own company.
 */
export const DATA_CONTROLLER = { name: "Barry Whiting", email: CONTACT.privacy };

export interface PlanFeature {
  text: string;
  /** What the plan holds back or caps, shown in amber beside what it includes (KES-131). */
  limit?: true;
}

export interface Plan {
  name: string;
  monthly: string;
  yearly: string | null;
  summary: string;
  /** What it includes first, then its limits. */
  features: PlanFeature[];
}

export const PLANS: Plan[] = [
  {
    name: "Free",
    monthly: "£0",
    yearly: null,
    summary: "See what's being planned near you.",
    features: [
      { text: "Free, for as long as you like" },
      { text: "New planning applications near you, picked out for your trade" },
      { text: "Save up to 10 leads" },
      { text: "Leads 7 days after they're published", limit: true },
      // Held back on Free (KES-52), said up front so nobody's surprised.
      { text: "The area only: no address, council link or applicant's name", limit: true },
      { text: "1 trade, up to 15 miles", limit: true },
      { text: "A weekly email, no push alerts", limit: true },
    ],
  },
  {
    name: "Solo",
    monthly: "£29",
    yearly: "£290",
    summary: "Hear about jobs in your trade first.",
    features: [
      { text: "Leads as soon as they're published" },
      { text: "Full details: the address, council link and, if a company applied, its name" },
      { text: "Push alerts and a daily email at 07:30" },
      { text: "Save as many leads as you like" },
      { text: "1 trade", limit: true },
      { text: "Up to 15 miles", limit: true },
    ],
  },
  {
    name: "Pro",
    monthly: "£49",
    yearly: "£490",
    summary: "Every trade, further afield.",
    features: [
      { text: "Leads as soon as they're published" },
      { text: "Full details: the address, council link and, if a company applied, its name" },
      { text: "Push alerts and a daily email at 07:30" },
      { text: "Save as many leads as you like" },
      { text: "All 4 trades" },
      { text: "Up to 50 miles" },
    ],
  },
];

export const PROMISES = [
  "14 days of Pro free, with no card needed",
  "No contract and no per-lead fees",
  "Cancel any time",
  "Keep using Kestlow free if you don't subscribe",
];
