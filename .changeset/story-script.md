---
"web": patch
---

Add `npm run story <name>` (KES-57), which starts Storybook with only the stories files whose name contains `<name>`, e.g. `npm run story LeadsView`, so it starts faster and the sidebar shows just those. Run without a name, it shows the stories files as a list to pick from with the arrow keys and Enter. `npm run storybook` still shows every story. Both now stop a Storybook already running on port 6180 before starting, and refuse, without touching it, if something else is using the port, and open Storybook once it's ready, with `$BROWSER` if set, otherwise in Edge from WSL (`BROWSER=none` skips that).
