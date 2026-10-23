---
"web": patch
---

Add `npm run story <name>` (KES-57), which starts Storybook with only the stories files whose name contains `<name>`, e.g. `npm run story LeadsView`, so it starts faster and the sidebar shows just those. Run without a name, it lists the stories files. `npm run storybook` still shows every story.
