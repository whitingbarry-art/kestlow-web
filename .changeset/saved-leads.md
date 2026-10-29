---
"web": minor
---

Keep saved leads in your account (KES-24). Save now stores the lead through the API (`PUT` and `DELETE /me/saved/{id}`), and the Saved page lists what the API keeps (`GET /me/saved`), most recently saved first, so saved leads survive a reload and show on every device you sign in on. A save shows straight away and is put back if the API refuses it or can't be reached. A saved lead stays saved after it's too old to be a new lead.
