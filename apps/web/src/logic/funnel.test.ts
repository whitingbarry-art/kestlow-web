import { createStepRecorder, reasonFromCode } from "./funnel";

describe("counting sign-up steps (KES-130)", () => {
  it("posts the step, the code and the reason, and nothing else", async () => {
    const fetchFn = vi.fn<typeof fetch>(() => Promise.resolve(new Response(null, { status: 204 })));
    const record = createStepRecorder({ baseUrl: "https://api.test", fetchFn });

    record("register_refused", { source: "ad-free", reason: "password-too-weak" });

    await vi.waitFor(() => expect(fetchFn).toHaveBeenCalledOnce());
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe("https://api.test/events");
    expect(init).toMatchObject({ method: "POST", keepalive: true });
    expect(JSON.parse(init!.body as string)).toEqual({
      step: "register_refused",
      source: "ad-free",
      reason: "password-too-weak",
    });
  });

  it("never throws, even when the network does", async () => {
    const fetchFn = vi.fn<typeof fetch>(() => Promise.reject(new Error("offline")));
    const record = createStepRecorder({ fetchFn });

    expect(() => record("launch_viewed")).not.toThrow();
    await vi.waitFor(() => expect(fetchFn).toHaveBeenCalledOnce());
  });

  it("turns Better Auth's codes into reasons", () => {
    expect(reasonFromCode("USER_ALREADY_EXISTS")).toBe("user-already-exists");
    expect(reasonFromCode(undefined)).toBe("no-reply");
  });
});
