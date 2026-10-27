import { ApiError } from "./leads";

/** The signed-in user, from `GET /me`. */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
}

/** Signing in or registering either works or has a message to show. */
export type AuthResult = { ok: true } | { ok: false; message: string };

/** What the app needs from accounts (KES-23); tests and Storybook swap in a fake. */
export interface AuthApi {
  /** Resolves to null when nobody's signed in. */
  getMe: () => Promise<SessionUser | null>;
  signIn: (details: { email: string; password: string }) => Promise<AuthResult>;
  register: (details: { name: string; email: string; password: string }) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

/** Better Auth's error codes, in words a tradesperson would use. */
const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "That email and password don't match an account.",
  PASSWORD_TOO_SHORT: "Use a password of at least 8 characters.",
  PASSWORD_TOO_LONG: "Use a password of at most 128 characters.",
  USER_ALREADY_EXISTS: "There's already an account with that email. Sign in instead.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "There's already an account with that email. Sign in instead.",
  INVALID_EMAIL: "Enter a valid email address.",
  VALIDATION_ERROR: "Enter a valid email address and password.",
};
const FALLBACK = "Something went wrong. Please try again.";

/**
 * Accounts over HTTP, at the same address as the leads API (Better Auth's /auth routes).
 * `credentials: "include"` sends the session cookie when the API is on another origin.
 */
export function createHttpAuthApi(baseUrl = import.meta.env.VITE_API_URL || "/api"): AuthApi {
  const post = (path: string, body: object) =>
    fetch(`${baseUrl}/auth${path}`, {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  async function result(res: Response): Promise<AuthResult> {
    if (res.ok) return { ok: true };
    const { code } = (await res.json().catch(() => ({}))) as { code?: string };
    return { ok: false, message: (code && MESSAGES[code]) ?? FALLBACK };
  }

  return {
    getMe: async () => {
      const res = await fetch(`${baseUrl}/me`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (res.status === 401) return null;
      if (!res.ok) throw new ApiError(res.status, `GET /me failed with ${res.status}`);
      return (await res.json()) as SessionUser;
    },
    signIn: async ({ email, password }) =>
      result(await post("/sign-in/email", { email, password })),
    register: async ({ name, email, password }) =>
      result(await post("/sign-up/email", { name, email, password })),
    signOut: async () => {
      const res = await post("/sign-out", {});
      if (!res.ok) throw new ApiError(res.status, `POST /auth/sign-out failed with ${res.status}`);
    },
  };
}
