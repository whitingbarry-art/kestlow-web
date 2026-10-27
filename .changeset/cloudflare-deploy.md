---
"web": minor
---

Deploy the web app to Cloudflare Pages (KES-19). The new Deploy workflow builds the app and deploys it on every merge to `main`, and the build calls the deployed API at `VITE_API_URL`, set from the `API_URL` repository variable. Locally the app still uses Vite's `/api` proxy.
