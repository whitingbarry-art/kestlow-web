import type { ContactTopic } from "../data/contact";
import { ApiError } from "./leads";

/** What the Contact us form sends to `POST /contact` (KES-116). */
export interface ContactMessage {
  name: string;
  email: string;
  topic: ContactTopic | "";
  message: string;
  /** The hidden spam trap: people leave it empty. */
  website: string;
}

/** The API's message for each field that needs fixing. */
export type ContactErrors = Partial<Record<"name" | "email" | "topic" | "message", string>>;

export type SendResult = { ok: true } | { ok: false; errors: ContactErrors };

export type SendContact = (message: ContactMessage) => Promise<SendResult>;

/** Sends over HTTP, at the same address as the leads API. Throws ApiError if it can't. */
export function createHttpSendContact(
  baseUrl = import.meta.env.VITE_API_URL || "/api",
): SendContact {
  return async (message) => {
    const res = await fetch(`${baseUrl}/contact`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    if (res.ok) return { ok: true };
    if (res.status === 400) {
      const body = (await res.json()) as { fields?: ContactErrors };
      if (body.fields) return { ok: false, errors: body.fields };
    }
    throw new ApiError(res.status, `POST /contact failed with ${res.status}`);
  };
}
