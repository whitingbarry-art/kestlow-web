import { ApiError } from "./leads";
import { createHttpJoinWaitlist, type WaitlistSignup } from "./waitlist";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const SIGNUP: WaitlistSignup = {
  email: "dave@example.com",
  postcode: "BR1",
  trades: ["Roofing"],
  currentSpend: "nothing",
  wouldPay: "20-40",
  plan: "solo-monthly",
  website: "",
};

describe("createHttpJoinWaitlist", () => {
  const fetch = vi.fn<typeof globalThis.fetch>();
  const join = createHttpJoinWaitlist("/api");

  beforeEach(() => vi.stubGlobal("fetch", fetch));
  afterEach(() => {
    fetch.mockReset();
    vi.unstubAllGlobals();
  });

  it("posts the sign-up as JSON", async () => {
    fetch.mockResolvedValue(json({ status: "joined" }, 201));

    await expect(join(SIGNUP)).resolves.toEqual({ ok: true });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("/api/waitlist");
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("Content-Type")).toBe("application/json");
    expect(JSON.parse(init?.body as string)).toEqual(SIGNUP);
  });

  it("returns the answers that need fixing", async () => {
    const fields = { email: "Enter a valid email address." };
    fetch.mockResolvedValue(json({ error: "Some answers need fixing.", fields }, 400));

    await expect(join(SIGNUP)).resolves.toEqual({ ok: false, errors: fields });
  });

  it.each([
    [500, { error: "Boom" }],
    [400, { error: "Send the sign-up as a JSON object." }],
    [413, { error: "That sign-up is too large." }],
  ])("throws an ApiError for a %i without answers to fix", async (status, body) => {
    fetch.mockResolvedValue(json(body, status));

    await expect(join(SIGNUP)).rejects.toEqual(
      new ApiError(status, `POST /waitlist failed with ${status}`),
    );
  });
});
