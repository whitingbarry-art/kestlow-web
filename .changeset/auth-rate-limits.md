---
"web": patch
---

Explain when sign-in is slowed down (KES-45). When the API refuses a sign-in or sign-up because of too many tries (`TOO_MANY_ATTEMPTS`, 429), the sign-in screen says "Too many tries. Wait a minute and try again." instead of "Something went wrong".
