---
"web": patch
---

Split Storybook checks into two workflows. **Storybook** builds Storybook and renders every story in headless Chromium through `@storybook/addon-vitest`, failing on any render error (`npm run test-storybook`). **UI Tests** runs Chromatic, which publishes Storybook and flags visual changes for the author or reviewer to accept or reject before merging.
