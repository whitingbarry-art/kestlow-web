// The plans and prices, from the Architecture and Delivery Plan's "Pricing and billing" section,
// as the launch page and /pricing show them (KES-97, KES-125). Stripe holds the prices charged.

import { CONTACT } from "./contact";

/**
 * Who collects the waitlist's details and how to reach them, as UK GDPR requires. Change the name
 * once Kestlow is its own company.
 */
export const DATA_CONTROLLER = { name: "Barry Whiting", email: CONTACT.privacy };

export interface Plan {
  name: string;
  monthly: string;
  yearly: string | null;
  summary: string;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    name: "Free",
    monthly: "£0",
    yearly: null,
    summary: "See what's being planned near you.",
    features: [
      "Leads 7 days after they're published",
      "1 trade",
      "Up to 15 miles",
      "Weekly email",
      "Save up to 10 leads",
    ],
  },
  {
    name: "Solo",
    monthly: "£29",
    yearly: "£290",
    summary: "Hear about jobs in your trade first.",
    features: [
      "Leads as soon as they're published",
      "1 trade",
      "Up to 15 miles",
      "Push alerts and a daily email at 07:30",
      "Save as many leads as you like",
    ],
  },
  {
    name: "Pro",
    monthly: "£49",
    yearly: "£490",
    summary: "Every trade, further afield.",
    features: [
      "Leads as soon as they're published",
      "All 4 trades",
      "Up to 50 miles",
      "Push alerts and a daily email at 07:30",
      "Save as many leads as you like",
    ],
  },
];

export const PROMISES = [
  "14 days of Pro free, with no card needed",
  "No contract and no per-lead fees",
  "Cancel any time",
  "Keep using Kestlow free if you don't subscribe",
];
