/** Opens the app at Create your account (KES-125). */
const START_PARAM = "start";

/**
 * Where the launch page's buttons go: the app, straight to creating an account, with the ?ref=
 * the page was opened with, so the account records which card or ad brought them (KES-125).
 */
export function signUpHref(source?: string): string {
  const params = new URLSearchParams({ [START_PARAM]: "trial" });
  if (source) params.set("ref", source);
  return `/?${params.toString()}`;
}

/** Whether the app was opened from the launch page, to start at Create your account. */
export function openedToSignUp(search: string): boolean {
  return new URLSearchParams(search).has(START_PARAM);
}

/** The ?ref= the app was opened with, for the new account; the API keeps only tidy codes. */
export function sourceFrom(search: string): string | undefined {
  return new URLSearchParams(search).get("ref") ?? undefined;
}

/** The address without the launch page's ?start and ?ref, once the account is made. */
export function withoutSignUp(href: string): string {
  const url = new URL(href);
  url.searchParams.delete(START_PARAM);
  url.searchParams.delete("ref");
  return url.toString();
}
