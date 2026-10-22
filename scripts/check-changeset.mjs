// Fails unless the current branch adds at least one changeset with a meaningful summary
// and every package changed since the base branch is covered. Run by the pre-push hook
// and the Changeset PR check.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const base = process.env.CHANGESET_BASE ?? "origin/main";
const MIN_WORDS = 6;
const PLACEHOLDERS =
  /^(wip|tbd|todo|fix(es)?|update[sd]?|change[sd]?|changeset|misc|stuff|tweaks?)\.?$/i;

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const lines = (text) => text.split("\n").filter(Boolean);

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  console.error(
    "  Add one with `npm run changeset` (or `npm run changeset -- --empty` for changes",
  );
  console.error("  that don't touch a package), describe what changed and why, and commit it.\n");
  process.exit(1);
}

// Workspace packages as { name, dir }, from the root package.json "workspaces" globs (dir/*).
function workspacePackages() {
  const { workspaces = [] } = JSON.parse(readFileSync("package.json", "utf8"));
  return workspaces.flatMap((pattern) => {
    const parent = pattern.replace(/\/\*$/, "");
    if (!existsSync(parent)) return [];
    return readdirSync(parent)
      .map((entry) => join(parent, entry))
      .filter((dir) => existsSync(join(dir, "package.json")))
      .map((dir) => ({
        name: JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).name,
        dir,
      }));
  });
}

if (git("rev-parse", "--abbrev-ref", "HEAD") === "main") process.exit(0);

if (!process.env.CI) {
  try {
    git("fetch", "--quiet", "origin", base.replace(/^origin\//, ""));
  } catch {
    console.warn(`Could not fetch ${base}; checking against the local copy.`);
  }
}

const mergeBase = git("merge-base", base, "HEAD");
const changesets = lines(
  git("diff", "--name-only", "--diff-filter=A", mergeBase, "HEAD", "--", ".changeset/*.md"),
).filter((file) => !file.endsWith("README.md"));

if (changesets.length === 0) fail(`This branch adds no changeset (compared with ${base}).`);

const packages = workspacePackages();
const known = new Set(packages.map((pkg) => pkg.name));
const covered = new Set();

const problems = changesets.flatMap((file) => {
  const match = readFileSync(file, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n?---\r?\n([\s\S]*)$/);
  if (!match) return [`${file}: missing the --- front matter block.`];

  const [, frontMatter, body] = match;
  const issues = [];

  for (const line of lines(frontMatter)) {
    const name = line.match(/^\s*["']?([^"':]+)["']?\s*:/)?.[1];
    if (!name) continue;
    if (known.has(name)) covered.add(name);
    else issues.push(`${file}: unknown package "${name}".`);
  }

  const summary = body.trim();
  const words = summary.split(/\s+/).filter(Boolean).length;
  if (PLACEHOLDERS.test(summary)) {
    issues.push(`${file}: "${summary}" is a placeholder, not a summary.`);
  } else if (words < MIN_WORDS) {
    issues.push(
      `${file}: summary has ${words} word(s); write at least ${MIN_WORDS} saying what changed and why.`,
    );
  }
  return issues;
});

if (problems.length > 0) fail(`Changeset needs work:\n  ${problems.join("\n  ")}`);

const changedFiles = lines(git("diff", "--name-only", mergeBase, "HEAD"));
const uncovered = packages
  .filter((pkg) => changedFiles.some((file) => file.startsWith(`${pkg.dir}/`)))
  .filter((pkg) => !covered.has(pkg.name))
  .map((pkg) => pkg.name);

if (uncovered.length > 0) {
  fail(`Changed packages missing from every changeset: ${uncovered.join(", ")}.`);
}

console.log(
  `✔ ${changesets.length} changeset(s) with meaningful summaries cover every changed package.`,
);
