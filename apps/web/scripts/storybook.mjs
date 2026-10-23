// Starts Storybook on 127.0.0.1:6180, first stopping any Storybook already running there.
//   node scripts/storybook.mjs                every story (npm run storybook)
//   node scripts/storybook.mjs --only <name>  only the stories files whose name contains <name>
//                                             (npm run story <name>); with no name, lists them
import { execFileSync, spawn } from "node:child_process";
import { globSync, readFileSync } from "node:fs";
import { basename } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = 6180;
const args = process.argv.slice(2);
const label = (file) => basename(file).replace(/\.stories\.tsx?$/, "");

let only = "";
if (args[0] === "--only") {
  const name = args[1];
  const files = globSync("src/**/*.stories.{ts,tsx}").sort();
  const matches = name
    ? files.filter((file) => label(file).toLowerCase().includes(name.toLowerCase()))
    : [];
  if (matches.length === 0) {
    console.log(
      name
        ? `No stories file matches "${name}".`
        : "Usage: npm run story <name>, e.g. npm run story LeadsView",
    );
    console.log(`Stories files: ${files.map(label).join(", ")}`);
    process.exit(name ? 1 : 0);
  }
  only = matches.join(",");
  console.log(`Showing ${matches.map(label).join(", ")}.`);
}

/** The process listening on PORT, if any, as { pid, command }. */
function listener() {
  const out = execFileSync("ss", ["-ltnpH", `sport = :${PORT}`], { encoding: "utf8" });
  if (!out.trim()) return null;
  const pid = out.match(/pid=(\d+)/)?.[1];
  if (!pid) return { pid: null, command: "a process owned by another user" };
  const command = readFileSync(`/proc/${pid}/cmdline`, "utf8").replaceAll("\0", " ").trim();
  return { pid: Number(pid), command };
}

const running = listener();
if (running) {
  // Only ever stop a Storybook; anything else on the port is left alone.
  if (!running.pid || !running.command.includes("storybook")) {
    console.error(`Port ${PORT} is in use by ${running.command}. Stop it and try again.`);
    process.exit(1);
  }
  console.log(`Stopping the Storybook already running on port ${PORT}…`);
  process.kill(running.pid, "SIGTERM");
  for (let waited = 0; listener(); waited += 250) {
    if (waited >= 10_000) {
      console.error(`Storybook on port ${PORT} didn't stop. Stop it and try again.`);
      process.exit(1);
    }
    await sleep(250);
  }
}

console.log(`Starting Storybook at http://127.0.0.1:${PORT}`);
const storybook = spawn(
  "storybook",
  ["dev", "--host", "127.0.0.1", "-p", String(PORT), "--exact-port", "--no-open"],
  { stdio: "inherit", env: { ...process.env, STORYBOOK_ONLY: only } },
);
storybook.on("exit", (code) => process.exit(code ?? 0));
