import { act, renderHook, waitFor } from "@testing-library/react";
import type { LeadsApi } from "../api/leads";
import { createSampleLeadsApi } from "../api/sampleLeadsApi";
import { SAMPLE_LEADS } from "../data/leads";
import { providers } from "../test/providers";
import { useAlertSettings } from "./useAlertSettings";
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
    await expect(api.getBasePostcode()).resolves.toBe("SE9 1AA");
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
