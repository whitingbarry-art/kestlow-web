# kestlow-web

Accessibility is a requirement for every change: see [docs/accessibility.md](docs/accessibility.md).

## Running locally

The web app gets its leads from [kestlow-api](https://github.com/whitingbarry-art/kestlow-api). `npm run dev` in kestlow-api starts the database, the API and this app together; open http://127.0.0.1:5180. Running `npm run dev` here starts only the web app, which then needs the API already running on 127.0.0.1:5181: Vite proxies `/api` to it, so there's no CORS to set up. Tests and Storybook use the sample leads in `src/data/leads.ts` instead of the API.

`npm run check` runs the format check, lint, typecheck and unit tests; `npm run storybook` starts Storybook on http://127.0.0.1:6180 with every story; `npm run story LeadsView` starts it with only the stories files whose name contains `LeadsView` (`npm run story` lists them). Both stop a Storybook that's already running on 6180 first, but leave anything else on that port alone. `npm run test-storybook` renders every story with accessibility checks.
