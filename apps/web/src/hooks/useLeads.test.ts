import { act, renderHook } from "@testing-library/react";
import { useLeads } from "./useLeads";

describe("useLeads", () => {
  it("starts with lead 3 saved and nothing selected", () => {
    const { result } = renderHook(() => useLeads());
    expect(result.current.savedLeads.map((lead) => lead.id)).toEqual([3]);
    expect(result.current.selectedLead).toBeUndefined();
  });

  it("selects the first lead when asked", () => {
    const { result } = renderHook(() => useLeads({ selectFirstLead: true }));
    expect(result.current.selectedId).toBe(1);
  });

  it("filters by trade and updates the summary", () => {
    const { result } = renderHook(() => useLeads());
    act(() => result.current.setTrade("Landscaping"));
    expect(result.current.visibleLeads.map((lead) => lead.id)).toEqual([3]);
    expect(result.current.summary).toBe("0 new today within 15 miles");
  });

  it("toggles saved leads", () => {
    const { result } = renderHook(() => useLeads());
    act(() => result.current.toggleSaved(1));
    expect(result.current.isSaved(1)).toBe(true);
    act(() => result.current.toggleSaved(3));
    expect(result.current.savedLeads.map((lead) => lead.id)).toEqual([1]);
  });

  it("opens and closes the detail panel", () => {
    const { result } = renderHook(() => useLeads());
    act(() => result.current.openLead(2));
    expect(result.current.selectedLead?.address).toBe("Land at Mill Road");
    expect(result.current.isDetailOpen).toBe(true);
    act(() => result.current.closeDetail());
    expect(result.current.isDetailOpen).toBe(false);
    expect(result.current.selectedId).toBe(2);
  });
});
