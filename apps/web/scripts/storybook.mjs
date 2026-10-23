// Starts Storybook on 127.0.0.1:6180, first stopping any Storybook already running there, and
// opens it in Edge once it's ready (set BROWSER=none to skip that).
//   node scripts/storybook.mjs                every story (npm run storybook)
//   node scripts/storybook.mjs --only <name>  only the stories files whose name contains <name>
//                                             (npm run story <name>); with no name, pick one
import { execFileSync, spawn } from "node:child_process";
import { globSync, readFileSync } from "node:fs";
import { basename } from "node:path";
import { emitKeypressEvents } from "node:readline";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = 6180;
const URL = `http://127.0.0.1:${PORT}`;
const args = process.argv.slice(2);
const label = (file) => basename(file).replace(/\.stories\.tsx?$/, "");

/** Lets you pick one of `items` with the arrow keys and Enter; null if cancelled. */
function pick(items, title) {
  const { stdin, stdout } = process;
  const rows = Math.min(items.length, Math.max(5, (stdout.rows ?? 24) - 4));
  let selected = 0;
  let top = 0;
  let drawn = false;

  const draw = () => {
    if (selected < top) top = selected;
    if (selected >= top + rows) top = selected - rows + 1;
    if (drawn) stdout.write(`\x1b[${rows + 1}A`);
    stdout.write(`\x1b[2K${title} (↑/↓ to move, Enter to open, Esc to cancel)\n`);
    for (let row = top; row < top + rows; row++) {
      const line = row === selected ? `\x1b[7m ❯ ${items[row]} \x1b[0m` : `   ${items[row]}`;
      stdout.write(`\x1b[2K${line}\n`);
    }
    drawn = true;
  };

  return new Promise((resolve) => {
    const done = (choice) => {
      stdin.off("keypress", onKey);
      stdin.setRawMode(false);
      stdin.pause();
      resolve(choice);
    };
    const onKey = (_text, key = {}) => {
      if (key.name === "up" || key.name === "k")
        selected = (selected - 1 + items.length) % items.length;
      else if (key.name === "down" || key.name === "j") selected = (selected + 1) % items.length;
      else if (key.name === "return") return done(items[selected]);
      else if (key.name === "escape" || key.name === "q" || (key.ctrl && key.name === "c"))
        return done(null);
      else return;
      draw();
    };
    emitKeypressEvents(stdin);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on("keypress", onKey);
    draw();
  });
}

let only = "";
if (args[0] === "--only") {
  const files = globSync("src/**/*.stories.{ts,tsx}").sort((a, b) =>
    label(a).localeCompare(label(b)),
  );
  let name = args[1];
  if (!name) {
    if (!process.stdin.isTTY) {
      console.log("Usage: npm run story <name>, e.g. npm run story LeadsView");
      console.log(`Stories files:\n${files.map((file) => `  ${label(file)}`).join("\n")}`);
      process.exit(0);
    }
    name = await pick(files.map(label), "Which stories?");
    if (!name) process.exit(0);
  }
  const matches = files.filter((file) => label(file).toLowerCase().includes(name.toLowerCase()));
  if (matches.length === 0) {
    console.log(`No stories file matches "${name}". Run npm run story to pick one.`);
    process.exit(1);
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

/** Opens `url` in Edge on Windows, from WSL. Elsewhere, or with BROWSER=none, it does nothing. */
function openInEdge(url) {
  const wsl = readFileSync("/proc/version", "utf8").toLowerCase().includes("microsoft");
  if (!wsl || process.env.BROWSER === "none") return;
  // cwd /mnt/c, so cmd.exe doesn't warn about starting in a WSL (UNC) path.
  spawn("cmd.exe", ["/c", "start", "msedge", url], { cwd: "/mnt/c", stdio: "ignore" }).unref();
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

console.log(`Starting Storybook at ${URL}`);
const storybook = spawn(
  "storybook",
  ["dev", "--host", "127.0.0.1", "-p", String(PORT), "--exact-port", "--no-open"],
  { stdio: "inherit", env: { ...process.env, STORYBOOK_ONLY: only } },
);
storybook.on("exit", (code) => process.exit(code ?? 0));

// Open the browser once Storybook answers, giving up after two minutes.
for (let waited = 0; waited < 120_000; waited += 500) {
  const ready = await fetch(`${URL}/index.json`).then(
    (res) => res.ok,
    () => false,
  );
  if (ready) {
    openInEdge(URL);
    break;
  }
  await sleep(500);
}
