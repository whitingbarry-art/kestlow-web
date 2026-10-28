---
"web": minor
---

Let people set their base postcode (KES-26). The Alerts page's Area card has a "Base postcode" box, loaded from and saved through the API (`GET` and `PUT /me/alert-settings`), which looks the postcode up with postcodes.io. A postcode that isn't shaped like one, or can't be found, shows the API's message under the box, which is marked invalid; once saved it says "Saved. Leads are now measured from SE9 1AA." and the leads, saved leads and open lead are fetched again with distances from the new base. Until a postcode is set, the box says leads are measured from central Bromley. The sample "AB1 2CD" postcode under the distance slider is gone.
