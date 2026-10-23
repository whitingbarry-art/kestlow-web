// Starts Storybook with only the stories files whose name contains the given text, e.g.
// `npm run story LeadsView`. Any further arguments go to `storybook dev`.
import { spawn } from "node:child_process";
import { globSync } from "node:fs";
import { basename } from "node:path";

const [name, ...storybookArgs] = process.argv.slice(2);
const files = globSync("src/**/*.stories.{ts,tsx}").sort();
const label = (file) => basename(file).replace(/\.stories\.tsx?$/, "");

const matches = name
  ? files.filter((file) => label(file).toLowerCase().includes(name.toLowerCase()))
  : [];
if (matches.length === 0) {
  console.error(
    name
      ? `No stories file matches "${name}".`
      : "Usage: npm run story <name>, e.g. npm run story LeadsView",
  );
  console.error(`Stories files: ${files.map(label).join(", ")}`);
  process.exit(1);
}

console.log(`Showing ${matches.map(label).join(", ")} at http://127.0.0.1:6180`);
const storybook = spawn(
  "storybook",
  ["dev", "--host", "127.0.0.1", "-p", "6180", "--no-open", ...storybookArgs],
  { stdio: "inherit", env: { ...process.env, STORYBOOK_ONLY: matches.join(",") } },
);
storybook.on("exit", (code) => process.exit(code ?? 1));
