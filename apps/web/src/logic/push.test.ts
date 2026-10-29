import type { LeadsApi } from "../api/leads";
import { createSampleLeadsApi } from "../api/sampleLeadsApi";
import { disablePush, enablePush, keyBytes, PushUnavailable, type PushBrowser } from "./push";

/** A browser whose push manager remembers one subscription. */
function fakeBrowser(permission: NotificationPermission = "granted", supported = true) {
  let current: PushSubscription | null = null;
  const unsubscribe = vi.fn(() => {
    current = null;
    return Promise.resolve(true);
  });
  const subscribe = vi.fn(() => {
    current = {
      endpoint: "https://push.test/this-browser",
      toJSON: () => ({
        endpoint: "https://push.test/this-browser",
        keys: { p256dh: "k", auth: "a" },
      }),
      unsubscribe,
    } as unknown as PushSubscription;
    return Promise.resolve(current);
  });
  const browser: PushBrowser = {
    supported,
    requestPermission: vi.fn(() => Promise.resolve(permission)),
    pushManager: () =>
      Promise.resolve({
        getSubscription: () => Promise.resolve(current),
        subscribe,
      } as unknown as PushManager),
  };
  return { browser, subscribe, unsubscribe };
}

const apiWithSpies = () => {
  const api = createSampleLeadsApi();
  return {
    ...api,
    subscribePush: vi.fn(api.subscribePush),
    unsubscribePush: vi.fn(api.unsubscribePush),
  } satisfies LeadsApi;
};

describe("keyBytes", () => {
  it("decodes a URL-safe base64 key", () => {
    expect([...keyBytes("AQID_-8")]).toEqual([1, 2, 3, 255, 239]);
  });
});

describe("enablePush", () => {
  it("asks permission, subscribes with Kestlow's key and saves the subscription", async () => {
    const api = apiWithSpies();
    const { browser, subscribe } = fakeBrowser();

    await enablePush(api, browser);

    expect(browser.requestPermission).toHaveBeenCalled();
    expect(subscribe).toHaveBeenCalledWith(expect.objectContaining({ userVisibleOnly: true }));
    expect(api.subscribePush).toHaveBeenCalledWith({
      endpoint: "https://push.test/this-browser",
      keys: { p256dh: "k", auth: "a" },
    });
  });

  it("explains blocked notifications", async () => {
    const { browser } = fakeBrowser("denied");

    await expect(enablePush(apiWithSpies(), browser)).rejects.toEqual(
      new PushUnavailable(
        "Notifications are blocked for Kestlow. Allow them in your browser's settings, then try again.",
      ),
    );
  });

  it("explains a browser without push, mentioning iPhones", async () => {
    const { browser } = fakeBrowser("granted", false);

    await expect(enablePush(apiWithSpies(), browser)).rejects.toThrow(
      /add Kestlow to your Home Screen/,
    );
  });

  it("explains when push isn't switched on for Kestlow yet", async () => {
    const api = { ...apiWithSpies(), getPushKey: () => Promise.resolve(null) };

    await expect(enablePush(api, fakeBrowser().browser)).rejects.toThrow(/aren't switched on yet/);
  });
});

describe("enablePush when the browser says no", () => {
  it("explains it, rather than blaming the connection", async () => {
    const { browser } = fakeBrowser();
    browser.pushManager = () =>
      Promise.resolve({
        getSubscription: () => Promise.resolve(null),
        subscribe: () => Promise.reject(new DOMException("Registration failed", "AbortError")),
      } as unknown as PushManager);

    await expect(enablePush(apiWithSpies(), browser)).rejects.toThrow(
      /wouldn't turn on push alerts/,
    );
  });
});

describe("disablePush", () => {
  it("forgets this browser and unsubscribes", async () => {
    const api = apiWithSpies();
    const { browser, unsubscribe } = fakeBrowser();
    await enablePush(api, browser);

    await disablePush(api, browser);

    expect(api.unsubscribePush).toHaveBeenCalledWith("https://push.test/this-browser");
    expect(unsubscribe).toHaveBeenCalled();
  });
});
