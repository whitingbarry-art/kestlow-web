import { forwardToApi, type ServiceBinding } from "../../src/api/forward";

// Cloudflare Pages Function for every /api/... request on the deployed site. API is the service
// binding to the kestlow-api Worker, set in wrangler.toml.
export const onRequest = ({ request, env }: { request: Request; env: { API: ServiceBinding } }) =>
  forwardToApi(request, env.API);
