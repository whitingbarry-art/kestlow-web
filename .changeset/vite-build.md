---
"web": minor
---

Build and serve the app with Vite instead of webpack. This removes webpack-dev-server and with it five high-severity `npm audit` findings (GHSA-vfj7-8cjw-p6xm in `braces`, which has no patched release). The dev server stays on 127.0.0.1:5180, and `npm run preview` serves the production build.
