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
