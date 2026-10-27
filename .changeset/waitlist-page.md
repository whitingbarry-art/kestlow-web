---
"web": minor
---

Add the waitlist landing page at /waitlist/ (KES-97). It explains what Kestlow does, shows the Free, Solo and Pro plans with their monthly and yearly prices and the founding-member offer, and has a sign-up form with a short survey: email, the postcode they work from, their trades, what they spend on finding work now, what they'd pay, and which plan they'd pick. There's no phone number or call booking. Answers are checked by the API; any that need fixing are listed in a summary that takes focus and links to each question, and each question is marked and described with its message. A hidden field catches spam bots. The page is its own Vite entry, so it doesn't load the app or the map. Adds an `error` colour, checked for contrast in both themes, and text inputs use the darker `muted` border so their edges meet 3:1.
