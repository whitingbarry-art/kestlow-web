/** A Cloudflare service binding: a Worker reached directly, without going over the internet. */
export interface ServiceBinding {
  fetch: (request: Request) => Promise<Response>;
}

/**
 * Passes a request for /api/... on to the API Worker as /..., the same as the Vite dev proxy.
 * The browser only ever talks to the web app's own site, so the session cookie is first-party:
 * browsers won't keep a cookie set by the API's workers.dev address for a pages.dev page. The
 * headers go through unchanged, including Origin (Better Auth's CSRF check) and CF-Connecting-IP
 * (the waitlist's rate limit).
 */
export async function forwardToApi(request: Request, api: ServiceBinding): Promise<Response> {
  const url = new URL(request.url);
  url.pathname = url.pathname.replace(/^\/api(?=\/|$)/, "") || "/";
  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  return api.fetch(
    new Request(url, {
      method: request.method,
      headers: request.headers,
      // Request bodies here are small JSON (the API refuses large ones), so reading it is fine.
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
    }),
  );
}
