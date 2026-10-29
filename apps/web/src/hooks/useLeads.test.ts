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
    const pending: LeadsApi = { ...createSampleLeadsApi(), listLeads: () => new Promise(() => {}) };
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
    expect(listLeads).toHaveBeenLastCalledWith({ trade: "Landscaping", sort: "newest", page: 1 });
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

  it("keeps the leads already shown when Show more fails", async () => {
    const api = createSampleLeadsApi(SAMPLE_LEADS, 2);
    const listLeads = vi
      .fn<LeadsApi["listLeads"]>()
      .mockImplementationOnce(api.listLeads)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockImplementation(api.listLeads);
    const { result } = await renderLeads(undefined, { ...api, listLeads });

    act(() => result.current.loadMoreLeads());
    await waitFor(() => expect(result.current.loadMoreFailed).toBe(true));
    expect(result.current.leadsStatus.isError).toBe(false);
    expect(result.current.visibleLeads).toHaveLength(2);

    act(() => result.current.loadMoreLeads());
    await waitFor(() => expect(result.current.visibleLeads).toHaveLength(4));
    expect(result.current.loadMoreFailed).toBe(false);
  });

  it("keeps the chosen lead selected after a trade change takes it off the list", async () => {
    const { result } = await renderLeads({ selectFirstLead: true });
    act(() => result.current.openLead("sample-1"));

    act(() => result.current.setTrade("Landscaping"));
    await waitFor(() => expect(ids(result.current.visibleLeads)).toEqual(["sample-3"]));
    expect(result.current.selectedId).toBe("sample-1");
    expect(result.current.selectedLead?.address).toBe("14 Orchard Lane");
  });

  it("lists the saved leads the API keeps, whatever trade is showing", async () => {
    const api = createSampleLeadsApi(SAMPLE_LEADS, 20, ["sample-3"]);
    const { result } = await renderLeads(undefined, api);

    act(() => result.current.setTrade("Roofing"));
    await waitFor(() => expect(ids(result.current.visibleLeads)).toEqual(["sample-1"]));
    expect(ids(result.current.savedLeads)).toEqual(["sample-3"]);
    expect(result.current.isSaved("sample-3")).toBe(true);
  });

  it("saves and unsaves through the API, newest first", async () => {
    const api = createSampleLeadsApi(SAMPLE_LEADS, 20, ["sample-3"]);
    const saveLead = vi.fn(api.saveLead);
    const unsaveLead = vi.fn(api.unsaveLead);
    const { result } = await renderLeads(undefined, { ...api, saveLead, unsaveLead });
    await waitFor(() => expect(result.current.savedStatus.isPending).toBe(false));

    act(() => result.current.toggleSaved("sample-1"));
    await waitFor(() => expect(ids(result.current.savedLeads)).toEqual(["sample-1", "sample-3"]));
    act(() => result.current.toggleSaved("sample-3"));
    await waitFor(() => expect(ids(result.current.savedLeads)).toEqual(["sample-1"]));

    expect(saveLead).toHaveBeenCalledWith("sample-1");
    expect(unsaveLead).toHaveBeenCalledWith("sample-3");
    // Kept by the API, so a reload or another device sees the same.
    expect(ids(await api.listSaved())).toEqual(["sample-1"]);
  });

  it("shows a save straight away, before the API answers", async () => {
    const api = createSampleLeadsApi();
    const { result } = await renderLeads(undefined, {
      ...api,
      saveLead: () => new Promise(() => {}),
    });
    await waitFor(() => expect(result.current.savedStatus.isPending).toBe(false));

    act(() => result.current.toggleSaved("sample-2"));

    await waitFor(() => expect(result.current.isSaved("sample-2")).toBe(true));
  });

  it("puts a save back when the API refuses it", async () => {
    const api = createSampleLeadsApi();
    let refuse: (error: Error) => void = () => {};
    const { result } = await renderLeads(undefined, {
      ...api,
      saveLead: () => new Promise((_resolve, reject) => (refuse = reject)),
    });
    await waitFor(() => expect(result.current.savedStatus.isPending).toBe(false));

    act(() => result.current.toggleSaved("sample-2"));
    await waitFor(() => expect(result.current.isSaved("sample-2")).toBe(true));

    act(() => refuse(new Error("Network error")));
    await waitFor(() => expect(result.current.isSaved("sample-2")).toBe(false));
    expect(result.current.savedLeads).toEqual([]);
  });

  it("drops a saved lead the API no longer has", async () => {
    const api = createSampleLeadsApi(SAMPLE_LEADS, 20, ["sample-2", "gone"]);
    const { result } = await renderLeads(undefined, api);
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

  describe("search and sort (KES-115)", () => {
    afterEach(() => {
      window.history.replaceState(null, "", "/");
      window.localStorage.clear();
    });

    it("searches once typing pauses, and puts the search in the address bar", async () => {
      const api = createSampleLeadsApi();
      const listLeads = vi.fn(api.listLeads);
      const { result } = await renderLeads(undefined, { ...api, listLeads });

      act(() => result.current.setSearchText("Orch"));
      act(() => result.current.setSearchText("Orchard"));
      await waitFor(() => expect(ids(result.current.visibleLeads)).toEqual(["sample-1"]));
      expect(listLeads).toHaveBeenLastCalledWith({ search: "Orchard", sort: "newest", page: 1 });
      // Only the finished word was sent, not each step of typing it.
      expect(listLeads.mock.calls.map(([query]) => query.search)).toEqual([undefined, "Orchard"]);
      expect(result.current.search).toBe("Orchard");
      expect(result.current.total).toBe(1);
      expect(window.location.search).toBe("?q=Orchard");
    });

    it("starts from a search in the address bar", async () => {
      window.history.replaceState(null, "", "/?q=foundry");
      const { result } = await renderLeads();

      expect(result.current.searchText).toBe("foundry");
      expect(ids(result.current.visibleLeads)).toEqual(["sample-4"]);
    });

    it("clears the search straight away", async () => {
      window.history.replaceState(null, "", "/?q=foundry");
      const { result } = await renderLeads();

      act(() => result.current.clearSearch());
      await waitFor(() => expect(result.current.visibleLeads).toHaveLength(4));
      expect(result.current.searchText).toBe("");
      expect(window.location.search).toBe("");
    });

    it("hides the count while a new search loads, rather than showing the last one's", async () => {
      const api = createSampleLeadsApi();
      let finish: () => void = () => {};
      const listLeads = vi.fn<LeadsApi["listLeads"]>((query) =>
        query.search
          ? new Promise((resolve) => {
              finish = () => void api.listLeads(query).then(resolve);
            })
          : api.listLeads(query),
      );
      const { result } = await renderLeads(undefined, { ...api, listLeads });
      expect(result.current.total).toBe(4);

      act(() => result.current.setSearchText("Orchard"));
      await waitFor(() => expect(result.current.search).toBe("Orchard"));
      expect(result.current.total).toBeUndefined();
      expect(result.current.visibleLeads).toHaveLength(4);

      act(() => finish());
      await waitFor(() => expect(result.current.total).toBe(1));
    });

    it("sorts as chosen and remembers it on this device", async () => {
      const { result, unmount } = await renderLeads();

      act(() => result.current.setSort("nearest"));
      await waitFor(() =>
        expect(ids(result.current.visibleLeads)).toEqual([
          "sample-1",
          "sample-2",
          "sample-4",
          "sample-3",
        ]),
      );
      unmount();

      const { result: again } = await renderLeads();
      expect(again.current.sort).toBe("nearest");
    });
  });
});
