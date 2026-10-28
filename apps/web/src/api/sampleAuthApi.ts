import type { AuthApi, SessionUser } from "./auth";

export const SAMPLE_USER: SessionUser = {
  id: "sample-user",
  name: "Dave Roofer",
  email: "dave@example.com",
  emailVerified: true,
};

/** The one password the sample accounts accept. */
export const SAMPLE_PASSWORD = "correct horse battery staple";

/**
 * An in-memory stand-in for accounts, for tests and Storybook. It starts with `user` signed in
 * (or nobody), signs in SAMPLE_USER with SAMPLE_PASSWORD, and registers anyone new.
 */
export function createSampleAuthApi(user: SessionUser | null = SAMPLE_USER): AuthApi {
  let current = user;
  return {
    getMe: () => Promise.resolve(current),
    signIn: ({ email, password }) => {
      if (email !== SAMPLE_USER.email || password !== SAMPLE_PASSWORD)
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
  };
}
