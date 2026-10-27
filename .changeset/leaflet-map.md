---
"web": minor
---

Show each lead's location on a real map (KES-31). Lead detail now has a Leaflet map with OpenStreetMap tiles and a pin on the application site, in place of the placeholder. The map is fixed, with no dragging, zooming or tab stops, so it can't trap the keyboard or need precise gestures. "Open a larger map" opens the site on OpenStreetMap in a new tab instead, and screen readers hear "Map showing where … is." It follows OpenStreetMap's tile usage policy: their tile URL, visible attribution, and no bulk or offline use. Tests and Storybook's test runs don't load tiles, and Chromatic ignores the map area.
