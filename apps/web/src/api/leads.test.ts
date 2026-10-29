import { SAMPLE_LEADS } from "../data/leads";
import { ApiError, createHttpLeadsApi } from "./leads";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("createHttpLeadsApi", () => {
  const fetch = vi.fn<typeof globalThis.fetch>();
  const api = createHttpLeadsApi("/api");

  beforeEach(() => vi.stubGlobal("fetch", fetch));
  afterEach(() => {
    fetch.mockReset();
    vi.unstubAllGlobals();
  });

  it("asks for a page of leads, with the trade when there is one", async () => {
    const page = { leads: SAMPLE_LEADS, page: 2, pageSize: 20, total: 24, newToday: 2 };
    fetch.mockResolvedValue(json(page));

    await expect(api.listLeads({ trade: "Roofing", page: 2 })).resolves.toEqual(page);
    expect(fetch.mock.calls[0][0]).toBe("/api/leads?page=2&trade=Roofing");

    fetch.mockResolvedValue(json(page));
    await api.listLeads({ page: 1 });
    expect(fetch.mock.calls[1][0]).toBe("/api/leads?page=1");
  });

  it("fetches one lead, or null when there's no such lead", async () => {
    fetch.mockResolvedValueOnce(json(SAMPLE_LEADS[0]));
    await expect(api.getLead("sample-1")).resolves.toEqual(SAMPLE_LEADS[0]);
    expect(fetch.mock.calls[0][0]).toBe("/api/leads/sample-1");

    fetch.mockResolvedValueOnce(json({ error: "No such lead." }, 404));
    await expect(api.getLead("gone")).resolves.toBeNull();
  });

  it("throws an ApiError when the API fails", async () => {
    fetch.mockResolvedValue(json({ error: "Boom" }, 500));

    await expect(api.listLeads({ page: 1 })).rejects.toEqual(
      new ApiError(500, "GET /leads?page=1 failed with 500"),
    );
    await expect(api.getLead("sample-1")).rejects.toBeInstanceOf(ApiError);
  });

  it("lists the saved leads, with the session cookie", async () => {
    fetch.mockResolvedValue(json({ leads: SAMPLE_LEADS.slice(0, 2) }));

    await expect(api.listSaved()).resolves.toEqual(SAMPLE_LEADS.slice(0, 2));
    expect(fetch.mock.calls[0][0]).toBe("/api/me/saved");
    expect(fetch.mock.calls[0][1]).toMatchObject({ credentials: "include" });
  });

  it("saves with PUT and unsaves with DELETE", async () => {
    fetch.mockImplementation(() => Promise.resolve(new Response(null, { status: 204 })));

    await api.saveLead("sample-1");
    await api.unsaveLead("sample-1");

    expect(fetch.mock.calls.map(([url, init]) => [init?.method, url])).toEqual([
      ["PUT", "/api/me/saved/sample-1"],
      ["DELETE", "/api/me/saved/sample-1"],
    ]);
    expect(fetch.mock.calls[0][1]).toMatchObject({ credentials: "include" });
  });

  it("throws an ApiError when saving fails", async () => {
    fetch.mockResolvedValue(json({ error: "No such lead." }, 404));

    await expect(api.saveLead("gone")).rejects.toEqual(
      new ApiError(404, "PUT /me/saved/gone failed with 404"),
    );
  });
});
