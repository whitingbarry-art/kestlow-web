import type { Trade } from "../types/lead";
import { ApiError } from "./leads";

/** What the landing page's form sends to `POST /waitlist` (KES-97). */
export interface WaitlistSignup {
  email: string;
  /** A full postcode or its first half; the API keeps only the first half. */
  postcode: string;
  trades: Trade[];
  currentSpend: string;
  wouldPay: string;
  plan: string;
  /** The hidden spam trap: people leave it empty. */
  website: string;
}

/** The API's message for each answer that needs fixing, keyed by its own field names. */
export type SignupErrors = Partial<
  Record<"email" | "postcode" | "trades" | "currentSpend" | "wouldPay" | "plan", string>
>;

export type JoinResult = { ok: true } | { ok: false; errors: SignupErrors };

export type JoinWaitlist = (signup: WaitlistSignup) => Promise<JoinResult>;

/** Joins over HTTP, at the same address as the leads API. Throws ApiError if it can't. */
export function createHttpJoinWaitlist(
  baseUrl = import.meta.env.VITE_API_URL || "/api",
): JoinWaitlist {
  return async (signup) => {
    const res = await fetch(`${baseUrl}/waitlist`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(signup),
    });
    if (res.ok) return { ok: true };
    if (res.status === 400) {
      const body = (await res.json()) as { fields?: SignupErrors };
      if (body.fields) return { ok: false, errors: body.fields };
    }
    throw new ApiError(res.status, `POST /waitlist failed with ${res.status}`);
  };
}
