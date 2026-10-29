/** Fails fast, with what to do, when the web app or API isn't running (KES-65). */
export default async function globalSetup() {
  const web = process.env.E2E_BASE_URL ?? "http://127.0.0.1:5180";
  for (const [name, url, start] of [
    ["web app", web, "npm run dev -w web"],
    ["API", `${web}/api/health`, "npm run dev -w api, in kestlow-api"],
  ]) {
    const up = await fetch(url).then(
      (res) => res.ok,
      () => false,
    );
    if (!up) throw new Error(`The ${name} isn't answering at ${url}. Start it with: ${start}`);
  }
}
