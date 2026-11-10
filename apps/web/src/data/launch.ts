// What the launch page says (KES-131). Every claim here is true of Kestlow today: check it
// against the API's PLAN_LIMITS and the councils we collect from before changing it.

import { CONTACT } from "./contact";
import { BRAND } from "./site";

/** The councils Kestlow collects planning applications from, as of November 2026. */
export const COUNCILS = [
  "Bromley",
  "Greenwich",
  "Bexley",
  "Lewisham",
  "Croydon",
  "Dartford",
  "Sevenoaks",
];

export type FeatureIcon =
  "sunrise" | "trade" | "map" | "councils" | "bell" | "search" | "save" | "phone";

export const FEATURES: { icon: FeatureIcon; title: string; text: string }[] = [
  {
    icon: "sunrise",
    title: "New leads every morning",
    text: "Every night we check the councils' new planning applications. By 7:30 the next morning they're in your email (on the free plan, every Monday).",
  },
  {
    icon: "trade",
    title: "Picked out for your trade",
    text: "Roofing, electrical, landscaping or groundworks: you see the applications that need what you do.",
  },
  {
    icon: "map",
    title: "On a map, with the distance",
    text: "Each lead shows how far it is from your base, on a map, as far as you'll travel.",
  },
  {
    icon: "councils",
    title: `${COUNCILS.length} councils around Bromley`,
    text: `${COUNCILS.join(", ").replace(/, ([^,]*)$/, " and $1")}, with more to come.`,
  },
  {
    icon: "bell",
    title: "Alerts on your phone",
    text: "Turn on push alerts and hear about new work the moment it's in, with Solo or Pro.",
  },
  {
    icon: "search",
    title: "Search by town or postcode",
    text: "Look up a street, a town or a postcode area to see what's planned there.",
  },
  {
    icon: "save",
    title: "Save the ones worth chasing",
    text: "Keep the leads you want to follow up in one place, ready when you are.",
  },
  {
    icon: "phone",
    title: "Made for your phone",
    text: "Use it in the van: it works in your phone's browser, and you can add it to your home screen.",
  },
];

/** The plans side by side, as the API's PLAN_LIMITS apply them. */
export const PLAN_ROWS: {
  label: string;
  free: string | boolean;
  solo: string | boolean;
  pro: string | boolean;
}[] = [
  { label: "Price", free: "£0", solo: "£29 a month", pro: "£49 a month" },
  {
    label: "New leads",
    free: "A week late",
    solo: "As soon as they're in",
    pro: "As soon as they're in",
  },
  { label: "Trades", free: "1", solo: "1", pro: "All 4" },
  {
    label: "Distance from your base",
    free: "Up to 15 miles",
    solo: "Up to 15 miles",
    pro: "Up to 50 miles",
  },
  { label: "Address, council link and company applicant", free: false, solo: true, pro: true },
  { label: "Push alerts", free: false, solo: true, pro: true },
  { label: "Email", free: "Weekly", solo: "Every morning", pro: "Every morning" },
  {
    label: "Saved leads",
    free: "Up to 10",
    solo: "As many as you like",
    pro: "As many as you like",
  },
];

export const FAQS: { question: string; answer: string }[] = [
  {
    question: "Where do the leads come from?",
    answer:
      "From the councils' public planning registers. Planning applications are public records: anyone can look them up. We collect the new ones every night, with help from PlanIt, a public planning data service, and pick out the ones that need your trade.",
  },
  {
    question: "Which areas do you cover?",
    answer: `${COUNCILS.join(", ").replace(/, ([^,]*)$/, " and $1")} councils. We're adding more, starting with the councils around these.`,
  },
  {
    question: "Does a lead mean I'll get the job?",
    answer:
      "No. A lead tells you about building work while it's still being planned, so you can get in touch early. Winning it is down to you.",
  },
  {
    question: "Why can't I see the homeowner's name?",
    answer:
      "We show the name of a company that applies, such as a builder or developer, but never a private homeowner's, to respect their privacy. You don't need a name to get in touch: write to the homeowner at the address.",
  },
  {
    question: "Can I contact the people on an application?",
    answer:
      "Planning applications are public, so you can use them to find work. Many list an agent or architect, who's often the best first contact. If you write to a homeowner, say who you are and how you found them, and stop if they ask you to.",
  },
  {
    question: "What happens after the free trial?",
    answer:
      "You get 14 days of Pro with no card needed. At the end, choose Solo or Pro, or carry on with the free plan. With no card on file, you're never charged by surprise.",
  },
  {
    question: "Can I cancel?",
    answer: `Yes, any time: there's no contract. Email ${CONTACT.billing} and we'll cancel it; you keep your plan until the end of the time you've paid for.`,
  },
  {
    question: "What do you do with my details?",
    answer:
      "Only what's needed to run your account and send your alerts. We never sell them. Our privacy notice has the details.",
  },
];

/**
 * The launch page's title and description for search results and link previews (KES-135).
 * index.html and waitlist/index.html repeat them for crawlers that don't run JavaScript.
 */
export const LAUNCH_TITLE = `${BRAND}: planning leads for tradespeople`;
export const LAUNCH_DESCRIPTION =
  "Planning leads for roofers, electricians, landscapers and groundworkers in south-east London and Kent, sent to your phone. Try Pro free for 14 days.";
