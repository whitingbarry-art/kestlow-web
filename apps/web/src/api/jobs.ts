import type { Lead, Trade } from "../types/lead";

/**
 * What the jobs page shows anyone (KES-155), from the API's `GET /public/jobs`: how many leads
 * for a trade there were within `radiusMiles` of a postcode in the last `days` days, and a few
 * recent ones as the free plan shows them.
 */
export interface JobsNear {
  postcode: string;
  trade: Trade;
  radiusMiles: number;
  days: number;
  total: number;
  examples: Lead[];
}

/** The jobs, or what to fix: a postcode we can't find, say. */
export type JobsResult =
  { ok: true; jobs: JobsNear } | { ok: false; error: string; field?: "postcode" | "trade" };

export type LoadJobs = (postcode: string, trade: Trade) => Promise<JobsResult>;

/** The jobs over HTTP; it rejects when the API can't answer at all. */
export function createJobsLoader(baseUrl = import.meta.env.VITE_API_URL || "/api"): LoadJobs {
  return async (postcode, trade) => {
    const query = new URLSearchParams({ postcode, trade });
    const res = await fetch(`${baseUrl}/public/jobs?${query}`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) return { ok: true, jobs: (await res.json()) as JobsNear };
    if (res.status === 400) {
      const { error, field } = (await res.json()) as { error: string; field?: "postcode" };
      return { ok: false, error, field };
    }
    if (res.status === 429)
      return { ok: false, error: "That's a lot of look-ups. Try again in a minute." };
    if (res.status === 503)
      return { ok: false, error: "We couldn't check that postcode just now. Try again soon." };
    throw new Error(`GET /public/jobs failed with ${res.status}`);
  };
}
