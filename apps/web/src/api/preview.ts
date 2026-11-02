import type { Lead, Trade } from "../types/lead";

/**
 * What the launch page shows anyone (KES-131), from the API's `GET /public/preview`: how many
 * leads there are near Bromley in the last `days` days, in all and for each trade, and a few
 * recent ones as the free plan shows them.
 */
export interface LeadsPreview {
  radiusMiles: number;
  days: number;
  total: number;
  byTrade: Record<Trade, number>;
  examples: Lead[];
}

export type LoadPreview = () => Promise<LeadsPreview>;

/** The preview over HTTP; it rejects when the API can't give one. */
export function createPreviewLoader(baseUrl = import.meta.env.VITE_API_URL || "/api"): LoadPreview {
  return async () => {
    const res = await fetch(`${baseUrl}/public/preview`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`GET /public/preview failed with ${res.status}`);
    return (await res.json()) as LeadsPreview;
  };
}
