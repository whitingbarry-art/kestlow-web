/** The jobs page (KES-155), where the ads and cards point. */
export const JOBS_PATH = "/jobs";

/** The jobs page with the card or ad's code, so we still see where people came from. */
export function jobsHref(source?: string): string {
  return source ? `${JOBS_PATH}?ref=${encodeURIComponent(source)}` : JOBS_PATH;
}
