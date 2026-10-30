/**
 * Tells Kestlow when something breaks in someone's browser (KES-38): what broke and on which page,
 * never who. The API keeps it for the morning's error summary.
 */

/** No more than this many reports from one page load, so a loop can't flood the API. */
const MAX_REPORTS = 5;

export interface ErrorReporter {
  report: (error: unknown) => void;
}

/** A reporter that posts to `${baseUrl}/client-errors`, once per distinct message. */
export function createErrorReporter({
  baseUrl = import.meta.env.VITE_API_URL || "/api",
  fetchFn = (...args: Parameters<typeof fetch>) => fetch(...args),
  page = () => window.location.pathname,
}: {
  baseUrl?: string;
  fetchFn?: typeof fetch;
  page?: () => string;
} = {}): ErrorReporter {
  const seen = new Set<string>();
  return {
    report(error) {
      const message =
        error instanceof Error ? error.message : typeof error === "string" ? error : String(error);
      if (!message || seen.has(message) || seen.size >= MAX_REPORTS) return;
      seen.add(message);
      // keepalive, so a report still goes if the page is closing; failures are ignored, as
      // there's nowhere left to report them.
      void fetchFn(`${baseUrl}/client-errors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          stack: error instanceof Error ? error.stack : undefined,
          page: page(),
        }),
        keepalive: true,
      }).catch(() => {});
    },
  };
}

/** Reports errors nothing else caught, and promises that failed with nothing to handle them. */
export function reportUncaughtErrors(reporter: ErrorReporter, target: Window = window) {
  target.addEventListener("error", (event) => reporter.report(event.error ?? event.message));
  target.addEventListener("unhandledrejection", (event) => reporter.report(event.reason));
}
