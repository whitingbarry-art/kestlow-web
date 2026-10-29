import type { DeliverySettings } from "../types/alerts";
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
  /** The base postcode and distance leads are measured with (KES-26, KES-25). */
  getAlertSettings: () => Promise<AlertSettings>;
  /** Changes only what's given. */
  updateAlertSettings: (changes: AlertSettingsChanges) => Promise<AlertSettingsResult>;
  /** The VAPID public key to subscribe to push alerts with, or null when push is off (KES-32). */
  getPushKey: () => Promise<string | null>;
  /** Saves this browser's push subscription, as `PushSubscription.toJSON()` gives it. */
  subscribePush: (subscription: PushSubscriptionJSON) => Promise<void>;
  /** Forgets one of the user's browsers. */
  unsubscribePush: (endpoint: string) => Promise<void>;
}

export interface AlertSettings {
  /** The base postcode, or null until it's set. */
  postcode: string | null;
  radiusMiles: number;
  /** Where leads are measured from: the postcode, or the default area until one is set. */
  base: { lat: number; lng: number };
  /** The trades they want alerts for. */
  trades: Trade[];
  delivery: DeliverySettings;
}

export interface AlertSettingsChanges {
  postcode?: string;
  radiusMiles?: number;
  trades?: Trade[];
  delivery?: DeliverySettings;
}

/** Changing settings either works, giving them back, or has a message to show. */
export type AlertSettingsResult =
  { ok: true; settings: AlertSettings } | { ok: false; message: string };

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
    async getPushKey() {
      const key = await get<{ publicKey: string }>("/push/key");
      return key?.publicKey ?? null;
    },
    async subscribePush(subscription) {
      const res = await fetch(`${baseUrl}/me/push-subscriptions`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
      if (!res.ok)
        throw new ApiError(res.status, `POST /me/push-subscriptions failed with ${res.status}`);
    },
    async unsubscribePush(endpoint) {
      const res = await fetch(`${baseUrl}/me/push-subscriptions`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      });
      if (!res.ok)
        throw new ApiError(res.status, `DELETE /me/push-subscriptions failed with ${res.status}`);
    },
    async getAlertSettings() {
      const settings = await get<AlertSettings>("/me/alert-settings");
      if (!settings) throw new ApiError(404, "GET /me/alert-settings failed with 404");
      return settings;
    },
    async updateAlertSettings(changes) {
      const res = await fetch(`${baseUrl}/me/alert-settings`, {
        method: "PUT",
        credentials: "include",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      if (res.ok) return { ok: true, settings: (await res.json()) as AlertSettings };
      // A wrong postcode or distance (400), or postcodes.io being down (503), come with a message.
      if (res.status === 400 || res.status === 503) {
        const { error } = (await res.json().catch(() => ({}))) as { error?: string };
        return { ok: false, message: error ?? "Something went wrong. Please try again." };
      }
      throw new ApiError(res.status, `PUT /me/alert-settings failed with ${res.status}`);
    },
  };
}
