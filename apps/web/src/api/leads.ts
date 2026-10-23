import type { Lead, LeadsPage, Trade } from "../types/lead";

/** What the app needs from the leads API; tests and Storybook swap in `createSampleLeadsApi`. */
export interface LeadsApi {
  listLeads: (query: { trade?: Trade; page: number }) => Promise<LeadsPage>;
  /** Resolves to null when there's no such lead. */
  getLead: (id: string) => Promise<Lead | null>;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * The real API over HTTP. In development Vite proxies `/api` to the local API on port 5181
 * (vite.config.mts); the deployed address arrives with KES-19.
 */
export function createHttpLeadsApi(baseUrl = "/api"): LeadsApi {
  /** The JSON body, or null for a 404. */
  async function get<T>(path: string): Promise<T | null> {
    const res = await fetch(`${baseUrl}${path}`, { headers: { Accept: "application/json" } });
    if (res.status === 404) return null;
    if (!res.ok) throw new ApiError(res.status, `GET ${path} failed with ${res.status}`);
    return (await res.json()) as T;
  }

  return {
    async listLeads({ trade, page }) {
      const params = new URLSearchParams({ page: String(page) });
      if (trade) params.set("trade", trade);
      const leads = await get<LeadsPage>(`/leads?${params}`);
      if (!leads) throw new ApiError(404, "GET /leads failed with 404");
      return leads;
    },
    getLead(id) {
      return get<Lead>(`/leads/${encodeURIComponent(id)}`);
    },
  };
}
