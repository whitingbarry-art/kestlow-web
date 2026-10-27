import { createHttpAuthApi } from "./auth";
import { ApiError } from "./leads";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const USER = { id: "u1", name: "Dave", email: "dave@example.com", emailVerified: false };

describe("createHttpAuthApi", () => {
  const fetch = vi.fn<typeof globalThis.fetch>();
  const api = createHttpAuthApi("/api");

  beforeEach(() => vi.stubGlobal("fetch", fetch));
  afterEach(() => {
    fetch.mockReset();
    vi.unstubAllGlobals();
  });

  it("asks who's signed in, sending the session cookie", async () => {
    fetch.mockResolvedValue(json(USER));

    await expect(api.getMe()).resolves.toEqual(USER);
    expect(fetch.mock.calls[0][0]).toBe("/api/me");
    expect(fetch.mock.calls[0][1]?.credentials).toBe("include");
  });

  it("returns null when nobody's signed in", async () => {
    fetch.mockResolvedValue(json({ error: "Sign in to see this." }, 401));

    await expect(api.getMe()).resolves.toBeNull();
  });

  it("throws an ApiError when /me fails another way", async () => {
    fetch.mockResolvedValue(json({}, 500));

    await expect(api.getMe()).rejects.toEqual(new ApiError(500, "GET /me failed with 500"));
  });

  it("signs in and registers through Better Auth's routes", async () => {
    fetch.mockResolvedValue(json({ token: "t" }));

    await expect(api.signIn({ email: "dave@example.com", password: "pw" })).resolves.toEqual({
      ok: true,
    });
    await api.register({ name: "Dave", email: "dave@example.com", password: "pw" });

    const [[signInUrl, signIn], [registerUrl, register]] = fetch.mock.calls;
    expect(signInUrl).toBe("/api/auth/sign-in/email");
    expect(signIn?.method).toBe("POST");
    expect(signIn?.credentials).toBe("include");
    expect(JSON.parse(signIn?.body as string)).toEqual({
      email: "dave@example.com",
      password: "pw",
    });
    expect(registerUrl).toBe("/api/auth/sign-up/email");
    expect(JSON.parse(register?.body as string)).toEqual({
      name: "Dave",
      email: "dave@example.com",
      password: "pw",
    });
  });

  it.each([
    ["INVALID_EMAIL_OR_PASSWORD", 401, "That email and password don't match an account."],
    ["PASSWORD_TOO_SHORT", 400, "Use a password of at least 8 characters."],
    [
      "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
      422,
      "There's already an account with that email. Sign in instead.",
    ],
    ["VALIDATION_ERROR", 400, "Enter a valid email address and password."],
    [
      "PASSWORD_TOO_WEAK",
      400,
      "Not strong enough yet. Try three random words, like ladder-teapot-rain.",
    ],
    ["SOMETHING_NEW", 500, "Something went wrong. Please try again."],
  ])("explains %s in plain words", async (code, status, message) => {
    fetch.mockResolvedValue(json({ code, message: "raw" }, status));

    await expect(api.signIn({ email: "a@b.c", password: "x" })).resolves.toEqual({
      ok: false,
      message,
    });
  });

  it("signs out, and throws if that fails", async () => {
    fetch.mockResolvedValueOnce(json({ success: true }));
    await api.signOut();
    expect(fetch.mock.calls[0][0]).toBe("/api/auth/sign-out");

    fetch.mockResolvedValueOnce(json({}, 500));
    await expect(api.signOut()).rejects.toBeInstanceOf(ApiError);
  });
});
