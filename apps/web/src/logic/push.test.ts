import type { LeadsApi } from "../api/leads";
import { createSampleLeadsApi } from "../api/sampleLeadsApi";
import {
  disablePush,
  enablePush,
  isPushOnHere,
  keyBytes,
  pushBlocker,
  PushUnavailable,
  type PushBrowser,
} from "./push";

/** A browser whose push manager remembers one subscription. */
function fakeBrowser(
  permission: NotificationPermission = "granted",
  supported = true,
  platform: { ios?: boolean; standalone?: boolean } = {},
) {
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
    ios: platform.ios ?? false,
    standalone: platform.standalone ?? false,
    requestPermission: vi.fn(() => Promise.resolve(permission)),
    permission: () => permission,
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

  it("explains a browser without push", async () => {
    const { browser } = fakeBrowser("granted", false);

    await expect(enablePush(apiWithSpies(), browser)).rejects.toThrow(
      "This browser can't show push alerts. Try Chrome, Edge, Firefox or Safari.",
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

describe("pushBlocker (KES-118)", () => {
  it("lets a browser with push go ahead", () => {
    expect(pushBlocker(fakeBrowser().browser)).toBeNull();
  });

  it("explains, step by step, that an iPhone needs Kestlow on its Home Screen", () => {
    // Even when it reports push, as Chrome pretending to be an iPhone does.
    for (const supported of [true, false])
      expect(pushBlocker(fakeBrowser("default", supported, { ios: true }).browser)).toBe(
        "On an iPhone or iPad, push alerts need Kestlow on your Home Screen. Tap the Share button, choose Add to Home Screen, then open Kestlow from your Home Screen and turn push on there.",
      );
  });

  it("lets an iPhone go ahead from the Home Screen", () => {
    expect(
      pushBlocker(fakeBrowser("default", true, { ios: true, standalone: true }).browser),
    ).toBeNull();
  });

  it("asks for a newer iOS when the Home Screen app still has no push", () => {
    expect(
      pushBlocker(fakeBrowser("default", false, { ios: true, standalone: true }).browser),
    ).toBe("Push alerts need iOS 16.4 or later. Update your iPhone or iPad, then try again.");
  });
});

describe("isPushOnHere (KES-118)", () => {
  it("is true once this browser is subscribed", async () => {
    const { browser } = fakeBrowser();
    expect(await isPushOnHere(browser)).toBe(false);

    await enablePush(apiWithSpies(), browser);

    expect(await isPushOnHere(browser)).toBe(true);
  });

  it("is false without permission, never asking for it", async () => {
    const { browser } = fakeBrowser("default");

    expect(await isPushOnHere(browser)).toBe(false);
    expect(browser.requestPermission).not.toHaveBeenCalled();
  });

  it("is false where push can't work", async () => {
    expect(await isPushOnHere(fakeBrowser("granted", true, { ios: true }).browser)).toBe(false);
    expect(await isPushOnHere(fakeBrowser("granted", false).browser)).toBe(false);
  });
});

describe("PushUnavailable's help flag (KES-120)", () => {
  it("marks the iPhone Home Screen steps as help, not a problem", async () => {
    const error = await enablePush(
      apiWithSpies(),
      fakeBrowser("default", true, { ios: true }).browser,
    ).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(PushUnavailable);
    expect((error as PushUnavailable).help).toBe(true);
  });

  it("marks everything else as a problem", async () => {
    const error = await enablePush(apiWithSpies(), fakeBrowser("denied").browser).catch(
      (e: unknown) => e,
    );
    expect((error as PushUnavailable).help).toBe(false);
  });
});
