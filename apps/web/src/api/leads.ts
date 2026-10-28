import type { Lead, LeadsPage, Trade } from "../types/lead";

/** What the app needs from the leads API; tests and Storybook swap in `createSampleLeadsApi`. */
export interface LeadsApi {
  listLeads: (query: { trade?: Trade; page: number }) => Promise<LeadsPage>;
  /** Resolves to null when there's no such lead. */
  getLead: (id: string) => Promise<Lead | null>;
  /** The signed-in user's saved leads, most recently saved first (KES-24). */
  listSaved: () => Promise<Lead[]>;
  saveLead: (id: string) => Promise<void>;
  unsaveLead: (id: string) => Promise<void>;
  /** The base postcode leads are measured from, or null until it's set (KES-26). */
  getBasePostcode: () => Promise<string | null>;
  setBasePostcode: (postcode: string) => Promise<BasePostcodeResult>;
}

/** Setting the base postcode either works, giving it back tidied up, or has a message to show. */
export type BasePostcodeResult = { ok: true; postcode: string } | { ok: false; message: string };

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
 * (vite.config.mts); on Cloudflare Pages a Pages Function passes `/api` to the API Worker
 * (functions/api). VITE_API_URL, set at build time, points a build at another address instead.
 */
export function createHttpLeadsApi(baseUrl = import.meta.env.VITE_API_URL || "/api"): LeadsApi {
  /** The JSON body, or null for a 404. */
  async function get<T>(path: string): Promise<T | null> {
    // The session cookie has to come along: leads need someone signed in (KES-22).
    const res = await fetch(`${baseUrl}${path}`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new ApiError(res.status, `GET ${path} failed with ${res.status}`);
    return (await res.json()) as T;
  }

  /** Saves or unsaves; both answer 204 with no body. */
  async function send(method: "PUT" | "DELETE", path: string): Promise<void> {
    const res = await fetch(`${baseUrl}${path}`, { method, credentials: "include" });
    if (!res.ok) throw new ApiError(res.status, `${method} ${path} failed with ${res.status}`);
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
    async listSaved() {
      const saved = await get<{ leads: Lead[] }>("/me/saved");
      if (!saved) throw new ApiError(404, "GET /me/saved failed with 404");
      return saved.leads;
    },
    saveLead: (id) => send("PUT", `/me/saved/${encodeURIComponent(id)}`),
    unsaveLead: (id) => send("DELETE", `/me/saved/${encodeURIComponent(id)}`),
    async getBasePostcode() {
      const settings = await get<{ postcode: string | null }>("/me/alert-settings");
      if (!settings) throw new ApiError(404, "GET /me/alert-settings failed with 404");
      return settings.postcode;
    },
    async setBasePostcode(postcode) {
      const res = await fetch(`${baseUrl}/me/alert-settings`, {
        method: "PUT",
        credentials: "include",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ postcode }),
      });
      if (res.ok) return { ok: true, ...((await res.json()) as { postcode: string }) };
      // A wrong postcode (400) or postcodes.io being down (503) come with a message to show.
      if (res.status === 400 || res.status === 503) {
        const { error } = (await res.json().catch(() => ({}))) as { error?: string };
        return { ok: false, message: error ?? "Something went wrong. Please try again." };
      }
      throw new ApiError(res.status, `PUT /me/alert-settings failed with ${res.status}`);
    },
  };
}
