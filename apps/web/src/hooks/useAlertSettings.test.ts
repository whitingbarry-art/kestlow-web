import { act, renderHook, waitFor } from "@testing-library/react";
import type { LeadsApi } from "../api/leads";
import { createSampleLeadsApi } from "../api/sampleLeadsApi";
import { SAMPLE_LEADS } from "../data/leads";
import { providers } from "../test/providers";
import { DISTANCE_SAVE_DELAY_MS, useAlertSettings } from "./useAlertSettings";
import { useLeads } from "./useLeads";

const renderSettings = (api: LeadsApi = createSampleLeadsApi()) =>
  renderHook(() => useAlertSettings(), { wrapper: providers(api) });

describe("useAlertSettings", () => {
  it("toggles delivery and trade settings", () => {
    const { result } = renderSettings();
    act(() => result.current.toggleDelivery("weekend"));
    act(() => result.current.toggleTrade("Roofing"));
    expect(result.current.delivery.weekend).toBe(true);
    expect(result.current.trades.Roofing).toBe(false);
  });

  it("clamps the distance and formats its label", () => {
    const { result } = renderSettings();
    act(() => result.current.setDistance(80));
    expect(result.current.distance).toBe(50);
    expect(result.current.distanceLabel).toBe("50 miles");
  });

  it("loads the saved distance and where leads are measured from", async () => {
    const api = createSampleLeadsApi();
    await api.updateAlertSettings({ radiusMiles: 25 });
    const { result } = renderSettings(api);

    await waitFor(() => expect(result.current.distance).toBe(25));
    expect(result.current.base).toEqual({ lat: 51.4057, lng: 0.0144 });
  });

  it("saves the distance once the slider stops, and the leads summary follows it", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const api = createSampleLeadsApi();
    const updateAlertSettings = vi.fn(api.updateAlertSettings);
    const { result } = renderHook(() => ({ leads: useLeads(), settings: useAlertSettings() }), {
      wrapper: providers({ ...api, updateAlertSettings }),
    });
    await waitFor(() => expect(result.current.settings.basePostcodeLoaded).toBe(true));

    act(() => result.current.settings.setDistance(20));
    act(() => result.current.settings.setDistance(30));
    // The slider shows 30 straight away, but nothing's sent while it's still moving.
    expect(result.current.settings.distance).toBe(30);
    expect(updateAlertSettings).not.toHaveBeenCalled();

    await act(() => vi.advanceTimersByTimeAsync(DISTANCE_SAVE_DELAY_MS));
    expect(updateAlertSettings).toHaveBeenCalledTimes(1);
    expect(updateAlertSettings).toHaveBeenCalledWith({ radiusMiles: 30 });
    await waitFor(() => expect(result.current.leads.summary).toMatch(/within 30 miles$/));
    vi.useRealTimers();
  });

  it("puts the slider back when the distance can't be saved", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const api = createSampleLeadsApi();
    const { result } = renderSettings({
      ...api,
      updateAlertSettings: () => Promise.reject(new Error("Network error")),
    });
    await waitFor(() => expect(result.current.basePostcodeLoaded).toBe(true));

    act(() => result.current.setDistance(40));
    await act(() => vi.advanceTimersByTimeAsync(DISTANCE_SAVE_DELAY_MS));

    await waitFor(() => expect(result.current.distance).toBe(15));
    vi.useRealTimers();
  });

  it("saves a distance that's still waiting when the page closes", async () => {
    const api = createSampleLeadsApi();
    const updateAlertSettings = vi.fn(api.updateAlertSettings);
    const { result, unmount } = renderSettings({ ...api, updateAlertSettings });

    act(() => result.current.setDistance(12));
    unmount();

    await waitFor(() => expect(updateAlertSettings).toHaveBeenCalledWith({ radiusMiles: 12 }));
  });

  it("loads the base postcode from the API", async () => {
    const { result } = renderSettings(createSampleLeadsApi(SAMPLE_LEADS, 20, [], "BR1 1AA"));

    await waitFor(() => expect(result.current.basePostcodeLoaded).toBe(true));
    expect(result.current.basePostcode).toBe("BR1 1AA");
  });

  it("saves a new base postcode and fetches the leads again, as their distances change", async () => {
    const api = createSampleLeadsApi();
    const listLeads = vi.fn(api.listLeads);
    const { result } = renderHook(() => ({ leads: useLeads(), settings: useAlertSettings() }), {
      wrapper: providers({ ...api, listLeads }),
    });
    await waitFor(() => expect(result.current.settings.basePostcodeLoaded).toBe(true));
    await waitFor(() => expect(listLeads).toHaveBeenCalledTimes(1));
    expect(result.current.settings.basePostcode).toBeNull();

    await act(() => result.current.settings.saveBasePostcode("se91aa"));

    await waitFor(() => expect(result.current.settings.basePostcode).toBe("SE9 1AA"));
    expect((await api.getAlertSettings()).postcode).toBe("SE9 1AA");
    await waitFor(() => expect(listLeads).toHaveBeenCalledTimes(2));
  });

  it("keeps the old base postcode when the new one can't be found", async () => {
    const { result } = renderSettings(createSampleLeadsApi(SAMPLE_LEADS, 20, [], "BR1 1AA"));
    await waitFor(() => expect(result.current.basePostcodeLoaded).toBe(true));

    const outcome = await act(() => result.current.saveBasePostcode("ZZ9 9ZZ"));

    expect(outcome).toEqual({
      ok: false,
      message: "We can't find ZZ9 9ZZ. Check it and try again.",
    });
    expect(result.current.basePostcode).toBe("BR1 1AA");
  });
});
