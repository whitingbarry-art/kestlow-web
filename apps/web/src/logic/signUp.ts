/** Opens the app at Create your account (KES-125). */
const START_PARAM = "start";
/** Opens the app at Sign in rather than the launch page (KES-131). */
const SIGN_IN_PARAM = "signin";

/** The launch page's Sign in link. */
export const SIGN_IN_HREF = `/?${SIGN_IN_PARAM}`;

/**
 * Where the launch page's buttons go: the app, straight to creating an account, with the ?ref=
 * the page was opened with, so the account records which card or ad brought them (KES-125).
 */
export function signUpHref(source?: string): string {
  const params = new URLSearchParams({ [START_PARAM]: "trial" });
  if (source) params.set("ref", source);
  return `/?${params.toString()}`;
}

/**
 * Whether someone signed out came for the sign-in screens (to sign in, create an account, or
 * get a new password link) rather than the launch page, which kestlow.co.uk shows otherwise.
 */
export function askedForAccount(search: string): boolean {
  const params = new URLSearchParams(search);
  return [START_PARAM, SIGN_IN_PARAM, "forgot"].some((name) => params.has(name));
}

/** Whether the app was opened from the launch page, to start at Create your account. */
export function openedToSignUp(search: string): boolean {
  return new URLSearchParams(search).has(START_PARAM);
}

/** The ?ref= the app was opened with, for the new account; the API keeps only tidy codes. */
export function sourceFrom(search: string): string | undefined {
  return new URLSearchParams(search).get("ref") ?? undefined;
}

/** The address without the launch page's ?start, ?signin and ?ref, once someone's in. */
export function withoutSignUp(href: string): string {
  const url = new URL(href);
  url.searchParams.delete(START_PARAM);
  url.searchParams.delete(SIGN_IN_PARAM);
  url.searchParams.delete("ref");
  return url.toString();
}
