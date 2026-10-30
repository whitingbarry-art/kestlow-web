import type { LeadsApi } from "../api/leads";

/**
 * Why push alerts couldn't be turned on in this browser, in words for the person. `help` marks
 * steps to follow, like adding Kestlow to an iPhone's Home Screen, rather than something wrong.
 */
export class PushUnavailable extends Error {
  constructor(
    message: string,
    readonly help = false,
  ) {
    super(message);
  }
}

/** What turning push on and off needs from the browser; tests pass fakes. */
export interface PushBrowser {
  supported: boolean;
  /** An iPhone or iPad, where push only works once Kestlow is on the Home Screen (KES-118). */
  ios: boolean;
  /** Opened from the Home Screen, as an app, rather than in the browser. */
  standalone: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  /** Whether notifications are allowed already, without asking. */
  permission: () => NotificationPermission;
  /** The registered service worker's push manager. */
  pushManager: () => Promise<PushManager>;
}

const hasWindow = typeof window !== "undefined";

export const browserPush: PushBrowser = {
  supported:
    hasWindow &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window,
  // iPads say they're Macs, but Macs don't have touch screens.
  ios:
    hasWindow &&
    (/iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)),
  standalone:
    hasWindow &&
    (window.matchMedia?.("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true),
  requestPermission: () => Notification.requestPermission(),
  permission: () => Notification.permission,
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

/** Why push can't start in this browser, or null when it can (KES-118). */
export function pushBlocker(browser: PushBrowser): string | null {
  // Checked first: Safari on an iPhone has no push at all until Kestlow's on the Home Screen.
  if (browser.ios && !browser.standalone)
    return "On an iPhone or iPad, push alerts need Kestlow on your Home Screen. Tap the Share button, choose Add to Home Screen, then open Kestlow from your Home Screen and turn push on there.";
  if (!browser.supported)
    return browser.ios
      ? "Push alerts need iOS 16.4 or later. Update your iPhone or iPad, then try again."
      : "This browser can't show push alerts. Try Chrome, Edge, Firefox or Safari.";
  return null;
}

/**
 * Turns push alerts on in this browser (KES-32): asks permission, subscribes with Kestlow's key
 * and saves the subscription. Throws PushUnavailable with a message when it can't.
 */
export async function enablePush(api: LeadsApi, browser: PushBrowser = browserPush) {
  const blocker = pushBlocker(browser);
  if (blocker) throw new PushUnavailable(blocker, browser.ios && !browser.standalone);
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

/**
 * Whether this browser itself gets push alerts: push can be on for the account but turned on on
 * another device (KES-118). Never asks for permission.
 */
export async function isPushOnHere(browser: PushBrowser = browserPush): Promise<boolean> {
  if (pushBlocker(browser) || browser.permission() !== "granted") return false;
  try {
    return (await (await browser.pushManager()).getSubscription()) !== null;
  } catch {
    return false;
  }
}

/** Turns push alerts off in this browser: unsubscribes and tells Kestlow to forget it. */
export async function disablePush(api: LeadsApi, browser: PushBrowser = browserPush) {
  if (!browser.supported) return;
  const subscription = await (await browser.pushManager()).getSubscription();
  if (!subscription) return;
  await api.unsubscribePush(subscription.endpoint);
  await subscription.unsubscribe();
}
