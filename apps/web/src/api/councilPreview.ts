import type { Lead, Trade } from "../types/lead";

/**
 * What a town and trade page shows anyone (KES-136), from the API's
 * `GET /public/councils/:council`: how many leads the council had in the last `days` days, in all
 * and for each trade, and a few recent ones for each trade as the free plan shows them.
 */
export interface CouncilPreview {
  council: string;
  days: number;
  total: number;
  byTrade: Record<Trade, number>;
  examples: Record<Trade, Lead[]>;
}

export type LoadCouncilPreview = (council: string) => Promise<CouncilPreview>;

/** The preview over HTTP; it rejects when the API can't give one. */
export function createCouncilPreviewLoader(
  baseUrl = import.meta.env.VITE_API_URL || "/api",
): LoadCouncilPreview {
  return async (council) => {
    const path = `/public/councils/${encodeURIComponent(council)}`;
    const res = await fetch(`${baseUrl}${path}`, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`GET ${path} failed with ${res.status}`);
    return (await res.json()) as CouncilPreview;
  };
}
