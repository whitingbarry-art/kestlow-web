---
"web": patch
---

Make sign-in work on the deployed site (KES-23). The live app now calls the API at its own `/api`, which a Cloudflare Pages Function passes to the kestlow-api Worker through a service binding, so the session cookie is first-party; browsers wouldn't keep the cookie from the API's separate workers.dev address. A session that ends mid-use (expired, or signed out in another tab) now brings back the sign-in screen instead of an error, and Create account still works if the password checker fails to download, leaving the strength check to the API.
