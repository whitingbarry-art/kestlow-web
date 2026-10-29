---
"web": minor
---

Keep trades and delivery choices in your account (KES-25). The Alerts toggles now save through `PUT /me/alert-settings`, show the change straight away, and flip back if it can't be saved, so the whole Alerts page (delivery, trades, postcode and distance) survives a reload and shows on every device. New accounts start with every trade and a daily email (no push, no weekends), as the API gives them; the old sample choices are gone. The page shows "Loading your alert settings…" until they arrive, so nothing changes under a finger, and an error with Try again if they can't be loaded. Changing trades or delivery doesn't fetch the leads again, as it doesn't change them.
