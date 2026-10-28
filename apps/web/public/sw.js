/* global self -- this runs as a service worker, where self is the worker itself */
// Kestlow's service worker (KES-32): shows push alerts for new leads, and opens Kestlow when one
// is tapped. Nothing else: no caching, so the app always loads fresh.

self.addEventListener("push", (event) => {
  let alert = {};
  try {
    alert = event.data ? event.data.json() : {};
  } catch {
    alert = { body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(alert.title || "New leads on Kestlow", {
      body: alert.body || "",
      icon: "/apple-touch-icon.png",
      data: { url: alert.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      // Back to Kestlow if it's already open, otherwise open it.
      const open = windows.find((client) => new URL(client.url).origin === self.location.origin);
      return open ? open.focus() : self.clients.openWindow(url);
    }),
  );
});
