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
  /** Changes the password and signs out every other device (KES-43). */
  changePassword: (details: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<AuthResult>;
  /** Signs out of every device, this one included. */
  signOutEverywhere: () => Promise<void>;
  /** Deletes the account and everything about the person, once the password checks out. */
  deleteAccount: (password: string) => Promise<AuthResult>;
  /** Emails a reset link if there's an account; the reply's the same either way (KES-41). */
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  /** Sets a new password with the token from the emailed link. */
  resetPassword: (details: { token: string; newPassword: string }) => Promise<AuthResult>;
  /** Confirms an email address with the token from the emailed link (KES-40). */
  verifyEmail: (token: string) => Promise<AuthResult>;
  /** Emails the confirmation link again. */
  resendVerification: (email: string) => Promise<AuthResult>;
  /** Emails a link to the new address; the email changes once it's opened (KES-43). */
  changeEmail: (details: { newEmail: string; password: string }) => Promise<AuthResult>;
}

export const WEAK_PASSWORD_MESSAGE =
  "Not strong enough yet. Try three random words, like ladder-teapot-rain.";

/** Better Auth's error codes, in words a tradesperson would use. */
const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "That email and password don't match an account.",
  PASSWORD_TOO_SHORT: "Use a password of at least 8 characters.",
  PASSWORD_TOO_LONG: "Use a password of at most 128 characters.",
  PASSWORD_TOO_WEAK: WEAK_PASSWORD_MESSAGE,
  USER_ALREADY_EXISTS: "There's already an account with that email. Sign in instead.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "There's already an account with that email. Sign in instead.",
  INVALID_EMAIL: "Enter a valid email address.",
  VALIDATION_ERROR: "Enter a valid email address and password.",
  INVALID_PASSWORD: "That isn't your current password.",
  PASSWORD_REQUIRED: "Enter your password to carry on.",
  INVALID_TOKEN: "This link has expired or has already been used. Ask for a new one.",
  TOKEN_EXPIRED: "This link has expired. Ask for a new one.",
  // The API's own limit on sign-in tries (KES-45).
  TOO_MANY_ATTEMPTS: "Too many tries. Wait a minute and try again.",
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
    changePassword: async ({ currentPassword, newPassword }) =>
      result(
        await post("/change-password", { currentPassword, newPassword, revokeOtherSessions: true }),
      ),
    signOutEverywhere: async () => {
      const res = await post("/revoke-sessions", {});
      if (!res.ok)
        throw new ApiError(res.status, `POST /auth/revoke-sessions failed with ${res.status}`);
    },
    deleteAccount: async (password) => result(await post("/delete-user", { password })),
    requestPasswordReset: async (email) => result(await post("/request-password-reset", { email })),
    resetPassword: async ({ token, newPassword }) =>
      result(await post("/reset-password", { token, newPassword })),
    verifyEmail: async (token) => {
      const res = await fetch(`${baseUrl}/auth/verify-email?token=${encodeURIComponent(token)}`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      // A made-up or expired token answers 401 without a code Better Auth's own messages use.
      if (res.status === 401) return { ok: false, message: MESSAGES.INVALID_TOKEN };
      return result(res);
    },
    resendVerification: async (email) => result(await post("/send-verification-email", { email })),
    changeEmail: async ({ newEmail, password }) =>
      result(await post("/change-email", { newEmail, password })),
  };
}
