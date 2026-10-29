import type { AuthApi, SessionUser } from "./auth";

export const SAMPLE_USER: SessionUser = {
  id: "sample-user",
  name: "Dave Roofer",
  email: "dave@example.com",
  emailVerified: true,
};

/** The one token the sample's emailed links carry; any other has expired. */
export const SAMPLE_TOKEN = "good";

/** The one password the sample accounts accept. */
export const SAMPLE_PASSWORD = "correct horse battery staple";

/**
 * An in-memory stand-in for accounts, for tests and Storybook. It starts with `user` signed in
 * (or nobody), signs in SAMPLE_USER with SAMPLE_PASSWORD, and registers anyone new. Everyone's
 * password starts as SAMPLE_PASSWORD, and can be changed.
 */
export function createSampleAuthApi(user: SessionUser | null = SAMPLE_USER): AuthApi {
  let current = user;
  let storedPassword = SAMPLE_PASSWORD;
  const wrongPassword = { ok: false, message: "That isn't your current password." } as const;
  const usedLink = {
    ok: false,
    message: "This link has expired or has already been used. Ask for a new one.",
  } as const;
  return {
    getMe: () => Promise.resolve(current),
    signIn: ({ email, password }) => {
      if (email !== SAMPLE_USER.email || password !== storedPassword)
        return Promise.resolve({
          ok: false,
          message: "That email and password don't match an account.",
        });
      current = SAMPLE_USER;
      return Promise.resolve({ ok: true });
    },
    register: ({ name, email, password }) => {
      if (password.length < 8)
        return Promise.resolve({ ok: false, message: "Use a password of at least 8 characters." });
      current = { id: "new-user", name, email, emailVerified: false };
      return Promise.resolve({ ok: true });
    },
    signOut: () => {
      current = null;
      return Promise.resolve();
    },
    changePassword: ({ currentPassword, newPassword }) => {
      if (currentPassword !== storedPassword) return Promise.resolve(wrongPassword);
      storedPassword = newPassword;
      return Promise.resolve({ ok: true });
    },
    signOutEverywhere: () => {
      current = null;
      return Promise.resolve();
    },
    deleteAccount: (given) => {
      if (given !== storedPassword) return Promise.resolve(wrongPassword);
      current = null;
      return Promise.resolve({ ok: true });
    },
    // The token "good" works; anything else has expired or been used.
    requestPasswordReset: () => Promise.resolve({ ok: true }),
    resetPassword: ({ token, newPassword }) => {
      if (token !== SAMPLE_TOKEN) return Promise.resolve(usedLink);
      storedPassword = newPassword;
      return Promise.resolve({ ok: true });
    },
    verifyEmail: (token) => {
      if (token !== SAMPLE_TOKEN) return Promise.resolve(usedLink);
      if (current) current = { ...current, emailVerified: true };
      return Promise.resolve({ ok: true });
    },
    resendVerification: () => Promise.resolve({ ok: true }),
    changeEmail: ({ password }) =>
      Promise.resolve(password === storedPassword ? { ok: true } : wrongPassword),
  };
}
