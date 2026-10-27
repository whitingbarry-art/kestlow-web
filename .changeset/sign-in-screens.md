---
"web": minor
---

Add sign-in, register and sign-out (KES-23). Signed-out people now see a "Sign in to Kestlow" screen instead of the app, with links to create an account and to get help with a forgotten password (resets arrive with KES-41). Registering asks for a name, email and a password of at least 8 characters. Better Auth's errors are shown in plain words, and switching between the screens moves focus to the new heading. Once signed in, the app appears and stays signed in across reloads; "Sign out" in the sidebar and the mobile top bar ends the session and clears that user's cached leads. Leads requests now send the session cookie, and text inputs share one style across forms.
