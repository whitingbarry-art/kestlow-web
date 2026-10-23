---
"web": minor
---

Load leads from the API (KES-20). The Leads view now shows real planning applications from kestlow-api with TanStack Query: 20 at a time with "Show more leads", filtered by trade on the server, and the new-today count from the API. Saved leads are fetched by id, so they stay listed whatever trade is showing, though they're still kept in memory until accounts arrive. Both views show loading and error states (with Try again) and the existing empty state. Dates are formatted for display ("Today", "18 Dec 2026"), a missing applicant or decision date says so, and "Open council page" links to the application. In development Vite proxies `/api` to the local API. Tests and Storybook use an in-memory API built from the sample leads until MSW arrives (KES-21).
