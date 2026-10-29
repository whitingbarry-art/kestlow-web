import { act, renderHook, waitFor } from "@testing-library/react";
import type { LeadsApi } from "../api/leads";
import { createSampleLeadsApi } from "../api/sampleLeadsApi";
import { SAMPLE_LEADS } from "../data/leads";
import type { PushBrowser } from "../logic/push";
import { providers } from "../test/providers";
import { DISTANCE_SAVE_DELAY_MS, useAlertSettings } from "./useAlertSettings";
import { useLeads } from "./useLeads";

const renderSettings = (api: LeadsApi = createSampleLeadsApi()) =>
  renderHook(() => useAlertSettings(), { wrapper: providers(api) });

describe("useAlertSettings", () => {
  it("toggles delivery and trade settings and saves them, so they survive a reload", async () => {
    const api = createSampleLeadsApi();
    const { result } = renderSettings(api);
    await waitFor(() => expect(result.current.basePostcodeLoaded).toBe(true));
    expect(result.current.delivery).toEqual({ email: true, push: false, weekend: false });
    expect(result.current.trades.Roofing).toBe(true);

    act(() => result.current.toggleDelivery("weekend"));
    act(() => result.current.toggleTrade("Roofing"));

    await waitFor(() => expect(result.current.delivery.weekend).toBe(true));
    expect(result.current.trades.Roofing).toBe(false);
    // Kept by the API, so a reload shows the same.
    await waitFor(async () =>
      expect(await api.getAlertSettings()).toMatchObject({
        delivery: { email: true, push: false, weekend: true },
        trades: ["Electrical", "Landscaping", "Groundworks"],
      }),
    );
  });

  it("puts a toggle back when it can't be saved", async () => {
    let refuse: (error: Error) => void = () => {};
    const api = createSampleLeadsApi();
    const { result } = renderSettings({
      ...api,
      updateAlertSettings: () => new Promise((_resolve, reject) => (refuse = reject)),
    });
    await waitFor(() => expect(result.current.basePostcodeLoaded).toBe(true));

    // Shown before the API has answered...
    act(() => result.current.toggleTrade("Groundworks"));
    await waitFor(() => expect(result.current.trades.Groundworks).toBe(false));

    // ...and put back when it says no.
    act(() => refuse(new Error("Network error")));
    await waitFor(() => expect(result.current.trades.Groundworks).toBe(true));
  });

  it("doesn't fetch the leads again for a trade or delivery change", async () => {
    const api = createSampleLeadsApi();
    const listLeads = vi.fn(api.listLeads);
    const { result } = renderHook(() => ({ leads: useLeads(), settings: useAlertSettings() }), {
      wrapper: providers({ ...api, listLeads }),
    });
    await waitFor(() => expect(result.current.settings.basePostcodeLoaded).toBe(true));
    await waitFor(() => expect(listLeads).toHaveBeenCalledTimes(1));

    act(() => result.current.settings.toggleDelivery("weekend"));
    await waitFor(async () => expect((await api.getAlertSettings()).delivery.weekend).toBe(true));

    expect(listLeads).toHaveBeenCalledTimes(1);
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

  describe("push alerts (KES-32)", () => {
    const browser = (permission: NotificationPermission): PushBrowser => {
      const subscription = {
        endpoint: "https://push.test/this-browser",
        toJSON: () => ({
          endpoint: "https://push.test/this-browser",
          keys: { p256dh: "k", auth: "a" },
        }),
        unsubscribe: () => Promise.resolve(true),
      } as unknown as PushSubscription;
      return {
        supported: true,
        requestPermission: () => Promise.resolve(permission),
        pushManager: () =>
          Promise.resolve({
            getSubscription: () => Promise.resolve(null),
            subscribe: () => Promise.resolve(subscription),
          } as unknown as PushManager),
      };
    };

    it("turns push on once this browser has permission and is saved", async () => {
      const api = createSampleLeadsApi();
      const subscribePush = vi.fn(api.subscribePush);
      const { result } = renderHook(() => useAlertSettings({ pushBrowser: browser("granted") }), {
        wrapper: providers({ ...api, subscribePush }),
      });
      await waitFor(() => expect(result.current.basePostcodeLoaded).toBe(true));

      act(() => result.current.toggleDelivery("push"));

      await waitFor(() => expect(result.current.delivery.push).toBe(true));
      expect(subscribePush).toHaveBeenCalled();
      expect(result.current.pushProblem).toBeNull();
    });

    it("leaves push off and says why when notifications are blocked", async () => {
      const { result } = renderHook(() => useAlertSettings({ pushBrowser: browser("denied") }), {
        wrapper: providers(createSampleLeadsApi()),
      });
      await waitFor(() => expect(result.current.basePostcodeLoaded).toBe(true));

      act(() => result.current.toggleDelivery("push"));

      await waitFor(() => expect(result.current.pushProblem).toMatch(/Notifications are blocked/));
      expect(result.current.delivery.push).toBe(false);
    });
  });
});
