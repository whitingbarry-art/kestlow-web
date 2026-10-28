---
"web": minor
---

Make the distance slider count, and show the area on a map (KES-25). The Alerts slider now saves the distance through `PUT /me/alert-settings` half a second after it stops moving (or straight away if you leave the page), goes back if it can't be saved, and comes back after a reload. The leads summary uses it ("1 new today within 5 miles"), and leads, saved leads and the open lead are fetched again. Under the slider, a map pins the base and shades the area covered, gliding in and out as the slider moves (any zoom level, not just whole ones, so the circle keeps its size on screen; no animation for people who prefer reduced motion), with a caption for screen readers. The lead map and area map now share their tiles, attribution, blueprint grid and pin (`components/maps/mapLayers.ts`). The web client's postcode calls became `getAlertSettings` and `updateAlertSettings`, which return the postcode, distance and base together.
