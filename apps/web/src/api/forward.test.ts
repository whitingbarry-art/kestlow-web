import { forwardToApi, type ServiceBinding } from "./forward";

function fakeApi() {
  const received: Request[] = [];
  const api: ServiceBinding = {
    fetch: (request) => {
      received.push(request);
      return Promise.resolve(new Response("ok"));
    },
  };
  return { api, received };
}

describe("forwardToApi", () => {
  it("drops the /api prefix and keeps the query", async () => {
    const { api, received } = fakeApi();
    await forwardToApi(new Request("https://kestlow-web.pages.dev/api/leads?trade=roofing"), api);
    expect(received[0].url).toBe("https://kestlow-web.pages.dev/leads?trade=roofing");
  });

  it("keeps the method, body and headers, so sign-in and its checks work", async () => {
    const { api, received } = fakeApi();
    await forwardToApi(
      new Request("https://kestlow-web.pages.dev/api/auth/sign-in/email", {
        method: "POST",
        headers: {
          Origin: "https://kestlow-web.pages.dev",
          "CF-Connecting-IP": "203.0.113.7",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "dave@example.com" }),
      }),
      api,
    );
    const request = received[0];
    expect(request.method).toBe("POST");
    expect(new URL(request.url).pathname).toBe("/auth/sign-in/email");
    expect(request.headers.get("Origin")).toBe("https://kestlow-web.pages.dev");
    expect(request.headers.get("CF-Connecting-IP")).toBe("203.0.113.7");
    expect(await request.text()).toBe('{"email":"dave@example.com"}');
  });

  it("only strips a whole /api segment", async () => {
    const { api, received } = fakeApi();
    await forwardToApi(new Request("https://kestlow-web.pages.dev/api"), api);
    await forwardToApi(new Request("https://kestlow-web.pages.dev/apiary"), api);
    expect(received.map((r) => new URL(r.url).pathname)).toEqual(["/", "/apiary"]);
  });
});
