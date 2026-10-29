---
"web": minor
---

Ask new accounts three questions before their first leads (KES-44). Anyone without a base postcode now goes through onboarding: 1, "Where are you based?" (the postcode, checked with postcodes.io), 2, "Which trades do you do?" (tick at least one) and 3, "How far will you travel?" (the distance slider with the area map), each saved through `PUT /me/alert-settings`, then "Show my leads" opens the app with leads measured their way. There's no skip: an empty or unknown postcode and no trades are refused with a message. Back goes to the previous question with answers kept, and Sign out is in the header. Focus moves to each new question, the page title follows it, and the choice to onboard is made once from the settings as they load, so saving the postcode on step 1 doesn't end it early.
