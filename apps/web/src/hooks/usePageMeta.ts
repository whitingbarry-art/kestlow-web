import { useEffect } from "react";

/** The one address search engines should show, whichever address served the page (KES-135). */
export const SITE_URL = "https://kestlow.co.uk";

export interface PageMeta {
  /** The browser tab's title, whole: "About us – Kestlow". */
  title: string;
  /** What search results and link previews say about the page; leave out for pages not in search. */
  description?: string;
  /** The page's own path on kestlow.co.uk, such as "/about", without ?ref= and the like. */
  path?: string;
}

/** Finds the <head> tag matching `selector`, adding it with `attributes` the first time. */
function headTag(tag: "meta" | "link", selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLElement>(selector);
  if (!element) {
    element = document.createElement(tag);
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
    document.head.append(element);
  }
  return element;
}

/**
 * Sets the tab title and, for a public page, the description and canonical address that search
 * engines and link previews read (KES-135).
 */
export function setPageMeta({ title, description, path }: PageMeta) {
  document.title = title;
  if (description === undefined) return;
  const url = `${SITE_URL}${path ?? window.location.pathname}`;
  headTag("meta", 'meta[name="description"]', { name: "description" }).setAttribute(
    "content",
    description,
  );
  headTag("link", 'link[rel="canonical"]', { rel: "canonical" }).setAttribute("href", url);
  headTag("meta", 'meta[property="og:title"]', { property: "og:title" }).setAttribute(
    "content",
    title,
  );
  headTag("meta", 'meta[property="og:description"]', { property: "og:description" }).setAttribute(
    "content",
    description,
  );
  headTag("meta", 'meta[property="og:url"]', { property: "og:url" }).setAttribute("content", url);
}

export function usePageMeta({ title, description, path }: PageMeta) {
  useEffect(() => setPageMeta({ title, description, path }), [title, description, path]);
}
