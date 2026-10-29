---
"web": minor
---

Turn on push alerts for new leads (KES-32, KES-33). A service worker (`/sw.js`) shows Kestlow's push alerts, with the logo, and tapping one opens Kestlow (or brings it forward if it's already open). Switching Push notifications on in Alerts asks the browser's permission, subscribes this browser with Kestlow's VAPID key from `/push/key` and saves it with `POST /me/push-subscriptions`; switching it off unsubscribes and forgets the browser, and push stops even if that fails. When it can't be turned on, the switch stays off and a message under the delivery choices says why: a browser without push (on an iPhone, add Kestlow to the Home Screen first), notifications blocked for Kestlow, the browser refusing (a private window, say), or push not switched on for Kestlow yet.
