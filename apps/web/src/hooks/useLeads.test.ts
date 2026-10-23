import { act, renderHook, waitFor } from "@testing-library/react";
import type { LeadsApi } from "../api/leads";
import { createSampleLeadsApi } from "../api/sampleLeadsApi";
import { SAMPLE_LEADS } from "../data/leads";
import { providers } from "../test/providers";
import { useLeads } from "./useLeads";

const ids = (leads: { id: string }[]) => leads.map((lead) => lead.id);

async function renderLeads(options?: Parameters<typeof useLeads>[0], api?: LeadsApi) {
  const hook = renderHook(() => useLeads(options), { wrapper: providers(api) });
  await waitFor(() => expect(hook.result.current.leadsStatus.isPending).toBe(false));
  return hook;
}

describe("useLeads", () => {
  it("loads the leads and the new-today summary", async () => {
    const { result } = await renderLeads();
    expect(ids(result.current.visibleLeads)).toEqual(ids(SAMPLE_LEADS));
    expect(result.current.summary).toBe("2 new today within 15 miles");
    expect(result.current.hasMoreLeads).toBe(false);
    expect(result.current.selectedLead).toBeUndefined();
  });

  it("shows the radius while the leads are loading", () => {
    const pending: LeadsApi = { listLeads: () => new Promise(() => {}), getLead: vi.fn() };
    const { result } = renderHook(() => useLeads(), { wrapper: providers(pending) });
    expect(result.current.leadsStatus.isPending).toBe(true);
    expect(result.current.summary).toBe("Within 15 miles");
  });

  it("reports a failed load and loads again on retry", async () => {
    const api = createSampleLeadsApi();
    const listLeads = vi
      .fn<LeadsApi["listLeads"]>()
      .mockRejectedValueOnce(new Error("Network error"))
      .mockImplementation(api.listLeads);
    const { result } = await renderLeads(undefined, { ...api, listLeads });
    expect(result.current.leadsStatus.isError).toBe(true);

    act(() => result.current.leadsStatus.retry());
    await waitFor(() => expect(result.current.visibleLeads).toHaveLength(4));
    expect(result.current.leadsStatus.isError).toBe(false);
  });

  it("selects the first lead once loaded, when asked", async () => {
    const { result } = await renderLeads({ selectFirstLead: true });
    expect(result.current.selectedId).toBe("sample-1");
  });

  it("asks the API for the chosen trade", async () => {
    const api = createSampleLeadsApi();
    const listLeads = vi.fn(api.listLeads);
    const { result } = await renderLeads(undefined, { ...api, listLeads });

    act(() => result.current.setTrade("Landscaping"));
    await waitFor(() => expect(ids(result.current.visibleLeads)).toEqual(["sample-3"]));
    expect(listLeads).toHaveBeenLastCalledWith({ trade: "Landscaping", page: 1 });
    expect(result.current.summary).toBe("0 new today within 15 miles");
  });

  it("loads more leads a page at a time", async () => {
    const { result } = await renderLeads(undefined, createSampleLeadsApi(SAMPLE_LEADS, 3));
    expect(result.current.visibleLeads).toHaveLength(3);
    expect(result.current.hasMoreLeads).toBe(true);

    act(() => result.current.loadMoreLeads());
    await waitFor(() => expect(result.current.visibleLeads).toHaveLength(4));
    expect(result.current.hasMoreLeads).toBe(false);
  });

  it("lists saved leads, fetching any that aren't showing", async () => {
    const api = createSampleLeadsApi();
    const getLead = vi.fn(api.getLead);
    const { result } = await renderLeads({ initialSavedIds: ["sample-3"] }, { ...api, getLead });

    act(() => result.current.setTrade("Roofing"));
    await waitFor(() => expect(ids(result.current.visibleLeads)).toEqual(["sample-1"]));
    expect(ids(result.current.savedLeads)).toEqual(["sample-3"]);

    act(() => result.current.toggleSaved("sample-1"));
    expect(result.current.isSaved("sample-1")).toBe(true);
    act(() => result.current.toggleSaved("sample-3"));
    expect(ids(result.current.savedLeads)).toEqual(["sample-1"]);
    // sample-1 was already on screen, so only the first saved lead needed its own fetch.
    expect(getLead.mock.calls.map(([id]) => id)).not.toContain("sample-1");
  });

  it("drops a saved lead the API no longer has", async () => {
    const { result } = await renderLeads({ initialSavedIds: ["sample-2", "gone"] });
    await waitFor(() => expect(result.current.savedStatus.isPending).toBe(false));
    expect(ids(result.current.savedLeads)).toEqual(["sample-2"]);
  });

  it("opens and closes the detail panel", async () => {
    const { result } = await renderLeads();
    act(() => result.current.openLead("sample-2"));
    expect(result.current.selectedLead?.address).toBe("Land at Mill Road");
    expect(result.current.isDetailOpen).toBe(true);
    act(() => result.current.closeDetail());
    expect(result.current.isDetailOpen).toBe(false);
    expect(result.current.selectedId).toBe("sample-2");
  });

  it("counts every open, including re-opening the lead already shown", async () => {
    const { result } = await renderLeads();
    act(() => result.current.openLead("sample-2"));
    act(() => result.current.openLead("sample-2"));
    expect(result.current.openCount).toBe(2);
  });
});
