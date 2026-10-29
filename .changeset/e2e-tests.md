---
"web": patch
---

Add end-to-end tests (KES-65): `npm run e2e -w web` drives the real app, API and database in Chromium on a desktop and a phone screen, covering signing up, onboarding and signing back in, the leads summary, search (including shared links), the remembered sort, the trade row and its triangles, the pages anyone can read, the contact form, and push's wording and iPhone steps. Each test makes its own `@example.invalid` account, failures keep a screenshot and trace, and `npm run e2e:watch -w web` runs them in a visible, slowed-down browser.
