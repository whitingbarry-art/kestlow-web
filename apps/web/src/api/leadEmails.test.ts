import { createHttpLeadEmailsApi, type LeadEmailsRequest } from "./leadEmails";
import { ApiError } from "./leads";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const REQUEST: LeadEmailsRequest = {
  email: "dave@example.com",
  postcode: "BR1",
  trade: "Roofing",
  source: "ad-first",
  website: "",
};

describe("createHttpLeadEmailsApi", () => {
  const fetch = vi.fn<typeof globalThis.fetch>();
  const api = createHttpLeadEmailsApi("/api");

  beforeEach(() => vi.stubGlobal("fetch", fetch));
  afterEach(() => {
    fetch.mockReset();
    vi.unstubAllGlobals();
  });

  it("asks for the weekly leads, and says whether a link was sent or the area isn't covered", async () => {
    fetch.mockResolvedValueOnce(json({ status: "sent" }, 201));
    fetch.mockResolvedValueOnce(json({ status: "outside" }));

    await expect(api.request(REQUEST)).resolves.toEqual({ ok: true, status: "sent" });
    await expect(api.request(REQUEST)).resolves.toEqual({ ok: true, status: "outside" });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("/api/lead-emails");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(init?.body as string)).toEqual(REQUEST);
  });

  it("returns the fields that need fixing, and throws when it can't answer", async () => {
    const fields = { postcode: "We couldn't find that postcode. Please check it." };
    fetch.mockResolvedValueOnce(json({ error: "Some answers need fixing.", fields }, 400));
    fetch.mockResolvedValueOnce(json({ error: "Too many" }, 429));

    await expect(api.request(REQUEST)).resolves.toEqual({ ok: false, errors: fields });
    await expect(api.request(REQUEST)).rejects.toBeInstanceOf(ApiError);
  });

  it("confirms with the link's token, telling an expired link from a failure", async () => {
    fetch.mockResolvedValueOnce(json({ status: "confirmed", sent: true }));
    fetch.mockResolvedValueOnce(json({ error: "expired" }, 404));
    fetch.mockResolvedValueOnce(json({ error: "oops" }, 500));

    await expect(api.confirm("t0k3n")).resolves.toEqual({ ok: true, sent: true });
    await expect(api.confirm("t0k3n")).resolves.toEqual({ ok: false });
    await expect(api.confirm("t0k3n")).rejects.toBeInstanceOf(ApiError);
    expect(fetch.mock.calls[0][0]).toBe("/api/lead-emails/confirm");
    expect(JSON.parse(fetch.mock.calls[0][1]?.body as string)).toEqual({ token: "t0k3n" });
  });

  it("stops the emails with the link's token", async () => {
    fetch.mockResolvedValueOnce(json({ status: "stopped" }));

    await api.stop("t0k3n");

    expect(fetch.mock.calls[0][0]).toBe("/api/lead-emails/stop");
    expect(JSON.parse(fetch.mock.calls[0][1]?.body as string)).toEqual({ token: "t0k3n" });
  });
});
