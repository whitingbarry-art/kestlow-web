/**
 * Kestlow's email addresses (KES-36). Each forwards to the founder's inbox through Cloudflare
 * Email Routing, so they can change hands without changing the site.
 */
export const CONTACT = {
  /** General questions and first contact. */
  hello: "hello@kestlow.co.uk",
  /** Help using Kestlow, such as getting back into an account. */
  support: "support@kestlow.co.uk",
  /** Payments and subscriptions. */
  billing: "billing@kestlow.co.uk",
  /** Requests to see or delete personal data (UK GDPR). */
  privacy: "privacy@kestlow.co.uk",
} as const;

/**
 * Kestlow's business address: a virtual office that scans post to the founder (KES-122). UK rules
 * need a sole trader trading under a business name to show an address for legal documents, and a
 * website business its geographic address, so it's on the legal pages, Contact us and the footer.
 */
export const BUSINESS_ADDRESS = "4th Floor, 18 St. Cross Street, London, EC1N 8UN";

/** What a Contact us message can be about, matching the API's topics (KES-116). */
export const CONTACT_TOPICS = [
  { value: "help", label: "Help using Kestlow" },
  { value: "feedback", label: "Feedback or an idea" },
  { value: "billing", label: "Billing" },
  { value: "privacy", label: "Privacy or my data" },
  { value: "other", label: "Something else" },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]["value"];
