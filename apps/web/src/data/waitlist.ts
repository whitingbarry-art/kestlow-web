// The plans and prices are the starting points from the Architecture and Delivery Plan's
// "Pricing and billing" section; the landing page tests them before launch (KES-97).

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
  "14 days of Pro free when we launch, with no card needed",
  "No contract and no per-lead fees",
  "Cancel, pause or switch plan in two clicks",
  "Your first payment back if you're not happy within 30 days",
];

export interface Option {
  value: string;
  label: string;
}

export const CURRENT_SPEND: Option[] = [
  { value: "nothing", label: "Nothing" },
  { value: "under-50", label: "Under £50 a month" },
  { value: "50-150", label: "£50 to £150 a month" },
  { value: "150-300", label: "£150 to £300 a month" },
  { value: "over-300", label: "Over £300 a month" },
];

export const WOULD_PAY: Option[] = [
  { value: "nothing", label: "Nothing, I'd only use a free plan" },
  { value: "under-20", label: "Under £20 a month" },
  { value: "20-40", label: "£20 to £40 a month" },
  { value: "40-60", label: "£40 to £60 a month" },
  { value: "over-60", label: "Over £60 a month" },
];

export const PLAN_CHOICES: Option[] = [
  { value: "free", label: "Free" },
  { value: "solo-monthly", label: "Solo, £29 a month" },
  { value: "solo-yearly", label: "Solo, £290 a year" },
  { value: "pro-monthly", label: "Pro, £49 a month" },
  { value: "pro-yearly", label: "Pro, £490 a year" },
  { value: "unsure", label: "Not sure yet" },
];
