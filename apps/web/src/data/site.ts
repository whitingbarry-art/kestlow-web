/** The one address search engines should show, whichever address served the page (KES-135). */
export const SITE_URL = "https://kestlow.co.uk";

/** The name where it stands as the brand, marked as our trade mark (KES-158, KES-159). */
export const BRAND = "Kestlow\u2122";

/** A browser tab's title, whole: "About us – Kestlow™". */
export const pageTitle = (page: string) => `${page} – ${BRAND}`;
