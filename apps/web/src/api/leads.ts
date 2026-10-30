import type { DeliverySettings } from "../types/alerts";
import type { BillingInterval, PaidPlan, SubscriptionSummary } from "../types/billing";
import type { Lead, LeadSort, LeadsPage, Trade } from "../types/lead";

/** What the app needs from the leads API; tests and Storybook swap in `createSampleLeadsApi`. */
export interface LeadsApi {
  /**
   * `search` matches the address, postcode or council, and `sort` defaults to newest first
   * (KES-115).
   */
  listLeads: (query: {
    trade?: Trade;
    search?: string;
    sort?: LeadSort;
    page: number;
  }) => Promise<LeadsPage>;
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
  /** The plan they're on, and whether the free trial is still on offer (KES-48, KES-49). */
  getSubscription: () => Promise<SubscriptionSummary>;
  /**
   * Starts the free Pro trial if they can have one, giving back their plan either way, or null
   * where payments aren't set up (KES-49).
   */
  startTrial: () => Promise<SubscriptionSummary | null>;
  /** A Stripe Checkout page for a plan, or a message to show instead (KES-50). */
  checkout: (plan: PaidPlan, interval: BillingInterval) => Promise<CheckoutResult>;
}

/** Checkout gives the page to send the person to, or a message to show. */
export type CheckoutResult = { ok: true; url: string } | { ok: false; message: string };

export interface AlertSettings {
  /** The base postcode, or null until it's set. */
  postcode: string | null;
  /** How far their plan covers, of the distance they chose (KES-123). */
  radiusMiles: number;
  /** The distance they chose, kept even beyond their plan; null until they choose (KES-123). */
  chosenRadiusMiles?: number | null;
  /** Where leads are measured from: the postcode, or the default area until one is set. */
  base: { lat: number; lng: number };
  /** The trades their plan covers, of the ones they chose (KES-52). */
  trades: Trade[];
  /**
   * Every trade they chose, in the order chosen, so the first is their main trade; null until
   * they choose (KES-52). A plan with more trades switches the rest on without choosing again.
   */
  chosenTrades?: Trade[] | null;
  delivery: DeliverySettings;
  /** The plan they're on and what it allows (KES-52); the settings above already fit it. */
  plan?: PaidPlan | "free";
  limits?: PlanLimits;
}

/** What someone's plan allows in their alert settings (KES-52). */
export interface PlanLimits {
  maxRadiusMiles: number;
  maxTrades: number;
  push: boolean;
  /** How often the email digest comes: every morning, or Monday mornings on the free plan. */
  digest?: "daily" | "weekly";
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
    async listLeads({ trade, search, sort, page }) {
      const params = new URLSearchParams({ page: String(page) });
      if (trade) params.set("trade", trade);
      if (search) params.set("q", search);
      if (sort && sort !== "newest") params.set("sort", sort);
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
    async getSubscription() {
      const subscription = await get<SubscriptionSummary>("/me/subscription");
      if (!subscription) throw new ApiError(404, "GET /me/subscription failed with 404");
      return subscription;
    },
    async startTrial() {
      const res = await fetch(`${baseUrl}/billing/trial`, {
        method: "POST",
        credentials: "include",
      });
      // Payments aren't set up (404), or the email isn't confirmed yet (403): no trial for now.
      if (res.status === 404 || res.status === 403) return null;
      if (!res.ok) throw new ApiError(res.status, `POST /billing/trial failed with ${res.status}`);
      return ((await res.json()) as { subscription: SubscriptionSummary }).subscription;
    },
    async checkout(plan, interval) {
      const res = await fetch(`${baseUrl}/billing/checkout`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval }),
      });
      if (res.ok) return { ok: true, url: ((await res.json()) as { url: string }).url };
      // Already on a plan (409), or payments not set up (404), come with a message.
      const { error } = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.status === 409 || res.status === 404)
        return { ok: false, message: error ?? "Payments aren't available just now." };
      throw new ApiError(res.status, `POST /billing/checkout failed with ${res.status}`);
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
      // A wrong postcode or distance (400), a setting beyond the plan (403, KES-52), or
      // postcodes.io being down (503), come with a message.
      if (res.status === 400 || res.status === 403 || res.status === 503) {
        const { error } = (await res.json().catch(() => ({}))) as { error?: string };
        return { ok: false, message: error ?? "Something went wrong. Please try again." };
      }
      throw new ApiError(res.status, `PUT /me/alert-settings failed with ${res.status}`);
    },
  };
}
