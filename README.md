# kestlow-web

Accessibility is a requirement for every change: see [docs/accessibility.md](docs/accessibility.md).

## Running locally

The web app gets its leads from [kestlow-api](https://github.com/whitingbarry-art/kestlow-api). `npm run dev` in kestlow-api starts the database, the API and this app together; open http://127.0.0.1:5180. Running `npm run dev` here starts only the web app, which then needs the API already running on 127.0.0.1:5181: Vite proxies `/api` to it, so there's no CORS to set up. Tests and Storybook use the sample leads in `src/data/leads.ts` instead of the API.

Deploy: every merge to `main` runs the **Deploy** workflow, which builds the app and deploys it to Cloudflare Pages (project `kestlow-web`), using the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets. The build calls the deployed API at the `API_URL` repository variable (`VITE_API_URL` at build time); locally it's unset and the app uses Vite's `/api` proxy.

`npm run check` runs the format check, lint, typecheck and unit tests; `npm run storybook` starts Storybook on http://127.0.0.1:6180 with every story; `npm run story LeadsView` starts it with only the stories files whose name contains `LeadsView`, and `npm run story` on its own lets you pick one from a list with the arrow keys and Enter. Both stop a Storybook that's already running on 6180 first (leaving anything else on that port alone), then open it once it's ready, with `$BROWSER` if you've set it, otherwise in Edge from WSL; `BROWSER=none` skips that. `npm run test-storybook` renders every story with accessibility checks.
