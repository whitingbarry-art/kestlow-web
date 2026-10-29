import { createErrorReporter, reportUncaughtErrors } from "./errorReporting";

function reporterWithSpy(fetchResult: Promise<Response> = Promise.resolve(new Response(null))) {
  const fetchFn = vi.fn<typeof fetch>(() => fetchResult);
  const reporter = createErrorReporter({ baseUrl: "/api", fetchFn, page: () => "/alerts" });
  const bodies = () =>
    fetchFn.mock.calls.map(
      ([, init]) => JSON.parse(init?.body as string) as Record<string, string>,
    );
  return { reporter, fetchFn, bodies };
}

describe("createErrorReporter", () => {
  it("posts what broke and on which page, so it still goes if the page is closing", () => {
    const { reporter, fetchFn, bodies } = reporterWithSpy();
    const error = new Error("Cannot read properties of undefined");

    reporter.report(error);

    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe("/api/client-errors");
    expect(init).toMatchObject({ method: "POST", keepalive: true });
    expect(bodies()).toEqual([
      { message: "Cannot read properties of undefined", stack: error.stack, page: "/alerts" },
    ]);
  });

  it("reports each different error once", () => {
    const { reporter, bodies } = reporterWithSpy();

    reporter.report(new Error("A"));
    reporter.report(new Error("A"));
    reporter.report("B");

    expect(bodies().map((body) => body.message)).toEqual(["A", "B"]);
  });

  it("stops after five, so a loop can't flood Kestlow", () => {
    const { reporter, fetchFn } = reporterWithSpy();

    for (let i = 0; i < 20; i++) reporter.report(new Error(`Error ${i}`));

    expect(fetchFn).toHaveBeenCalledTimes(5);
  });

  it("ignores a report that can't be sent", async () => {
    const { reporter } = reporterWithSpy(Promise.reject(new TypeError("Failed to fetch")));

    expect(() => reporter.report(new Error("offline"))).not.toThrow();
    await Promise.resolve();
  });
});

describe("reportUncaughtErrors", () => {
  it("reports errors and failed promises nothing else handled", () => {
    const report = vi.fn();
    const target = new EventTarget() as Window;
    reportUncaughtErrors({ report }, target);
    const error = new Error("thrown");

    target.dispatchEvent(Object.assign(new Event("error"), { error }));
    target.dispatchEvent(Object.assign(new Event("unhandledrejection"), { reason: "rejected" }));

    expect(report.mock.calls).toEqual([[error], ["rejected"]]);
  });
});
