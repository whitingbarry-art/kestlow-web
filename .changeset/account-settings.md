---
"web": minor
---

Add an Account page (KES-43), in the sidebar and bottom bar. It shows your name and email, and lets you change your password (current and new, with the strength meter; only Strong is accepted, counting your own name and email, and your other devices are signed out), sign out of all devices, and delete your account. Deleting takes two steps, so it can't happen by accident: "Delete my account…" explains that your account, saved leads and alert settings go for good and asks for your password, then "Delete my account" does it and shows the sign-in screen. Changing your email arrives with email verification (KES-40); until then the page says to email support@kestlow.co.uk. Buttons gain `danger` and `danger-ghost` styles, checked for contrast in both themes, and `Button` and `PasswordInput` pass a `ref` through.
