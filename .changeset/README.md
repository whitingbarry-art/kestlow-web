# Changesets

Every branch must add at least one changeset before it can be pushed or merged.
The pre-push hook and the **Changeset** PR check both run `scripts/check-changeset.mjs`.

- `npm run changeset` adds a changeset for the packages you changed.
- `npm run changeset -- --empty` adds one for changes that don't touch a package (CI, repo tooling).

Write the summary for someone reading the changelog: what changed and why, in at least a full sentence.
