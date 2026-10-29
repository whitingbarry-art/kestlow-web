import type { LeadsApi } from "../api/leads";

/** Why push alerts couldn't be turned on in this browser, in words for the person. */
export class PushUnavailable extends Error {}

/** What turning push on and off needs from the browser; tests pass fakes. */
export interface PushBrowser {
  supported: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  /** The registered service worker's push manager. */
  pushManager: () => Promise<PushManager>;
}

export const browserPush: PushBrowser = {
  supported:
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window,
  requestPermission: () => Notification.requestPermission(),
  // Subscribing needs an active service worker, which a first visit doesn't have straight away.
  pushManager: async () => {
    await navigator.serviceWorker.register("/sw.js");
    return (await navigator.serviceWorker.ready).pushManager;
  },
};

/** A VAPID key as the push manager wants it: the URL-safe base64 decoded to bytes. */
export function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

/**
 * Turns push alerts on in this browser (KES-32): asks permission, subscribes with Kestlow's key
 * and saves the subscription. Throws PushUnavailable with a message when it can't.
 */
export async function enablePush(api: LeadsApi, browser: PushBrowser = browserPush) {
  if (!browser.supported)
    throw new PushUnavailable(
      "This browser can't show push alerts. On an iPhone, add Kestlow to your Home Screen first.",
    );
  const key = await api.getPushKey();
  if (!key)
    throw new PushUnavailable("Push alerts aren't switched on yet. Email alerts still work.");
  if ((await browser.requestPermission()) !== "granted")
    throw new PushUnavailable(
      "Notifications are blocked for Kestlow. Allow them in your browser's settings, then try again.",
    );
  let subscription: PushSubscription;
  try {
    const manager = await browser.pushManager();
    subscription =
      (await manager.getSubscription()) ??
      (await manager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(key) }));
  } catch {
    // The browser or its push service said no, for instance in a private window.
    throw new PushUnavailable(
      "This browser wouldn't turn on push alerts. Check notifications are allowed for Kestlow, and that it isn't a private window, then try again.",
    );
  }
  await api.subscribePush(subscription.toJSON());
}

/** Turns push alerts off in this browser: unsubscribes and tells Kestlow to forget it. */
export async function disablePush(api: LeadsApi, browser: PushBrowser = browserPush) {
  if (!browser.supported) return;
  const subscription = await (await browser.pushManager()).getSubscription();
  if (!subscription) return;
  await api.unsubscribePush(subscription.endpoint);
  await subscription.unsubscribe();
}
