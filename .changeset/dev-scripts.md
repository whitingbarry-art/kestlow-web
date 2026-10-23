---
"web": patch
---

Add `npm run check`, which runs the Prettier check, then lint, typecheck and unit tests in one go, `npm run check:build`, which does the same and then builds, `npm run lint:fix`, which fixes what ESLint can fix by itself, and `npm run fix`, which runs Prettier and then ESLint's fixes (KES-57), so there's one command to run before pushing and less typing to tidy up lint errors.
