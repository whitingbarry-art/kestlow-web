---
"web": minor
---

Reset forgotten passwords and confirm email addresses (KES-41, KES-40). "Forgot your password?" now asks for an email and sends a reset link, answering "If there's a Kestlow account for …, we've sent a link. It works for one hour." either way. The link opens a new `/reset-password` page to choose a new password (Strong only, with the meter), then offers to sign in, as every device is signed out; an expired or used link says so and offers a new one, opening the sign-in screen at Forgot your password (`/?forgot`). The confirmation link opens `/verify-email`, which confirms straight away (asking only once) and says lead alerts can reach you now. Until then, a banner at the top of the app says "Please confirm your email", with "Send the link again". The signed-out screens share a new `AuthLayout`.
