import type { Trade } from "../types/lead";
import { ApiError } from "./leads";

/** What the free weekly leads form sends to `POST /lead-emails` (KES-137). */
export interface LeadEmailsRequest {
  email: string;
  /** A whole postcode or just its first half, such as BR1. */
  postcode: string;
  trade: Trade | "";
  /** The page's ?ref=, so we can see which ad or card brought them. */
  source?: string;
  /** The hidden spam trap: people leave it empty. */
  website: string;
}

/** The API's message for each field that needs fixing. */
export type LeadEmailsErrors = Partial<Record<"email" | "postcode" | "trade", string>>;

/** A confirm link was emailed; Kestlow doesn't cover that postcode yet; or fields need fixing. */
export type LeadEmailsResult =
  { ok: true; status: "sent" | "outside" } | { ok: false; errors: LeadEmailsErrors };

export interface LeadEmailsApi {
  request: (request: LeadEmailsRequest) => Promise<LeadEmailsResult>;
  /** Confirms the address; `sent` says whether the first leads went straight away. */
  confirm: (token: string) => Promise<{ ok: true; sent: boolean } | { ok: false }>;
  stop: (token: string) => Promise<void>;
}

/** Over HTTP, at the same address as the leads API. Throws ApiError when it can't answer. */
export function createHttpLeadEmailsApi(
  baseUrl = import.meta.env.VITE_API_URL || "/api",
): LeadEmailsApi {
  const post = (path: string, body: object) =>
    fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  const failed = (path: string, res: Response) =>
    new ApiError(res.status, `POST ${path} failed with ${res.status}`);

  return {
    async request(request) {
      const res = await post("/lead-emails", request);
      if (res.ok) {
        const { status } = (await res.json()) as { status: "sent" | "outside" };
        return { ok: true, status };
      }
      if (res.status === 400) {
        const body = (await res.json()) as { fields?: LeadEmailsErrors };
        if (body.fields) return { ok: false, errors: body.fields };
      }
      throw failed("/lead-emails", res);
    },
    async confirm(token) {
      const res = await post("/lead-emails/confirm", { token });
      if (res.status === 404) return { ok: false };
      if (!res.ok) throw failed("/lead-emails/confirm", res);
      const { sent } = (await res.json()) as { sent: boolean };
      return { ok: true, sent };
    },
    async stop(token) {
      const res = await post("/lead-emails/stop", { token });
      if (!res.ok) throw failed("/lead-emails/stop", res);
    },
  };
}
