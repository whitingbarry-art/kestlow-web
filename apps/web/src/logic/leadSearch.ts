import { LEAD_SORTS } from "../data/leads";
import type { LeadSort } from "../types/lead";

/** The address-bar parameter a lead search is kept in, so it can be bookmarked or shared. */
const SEARCH_PARAM = "q";
/** Where this device remembers the chosen sort. */
const SORT_KEY = "kestlow.leadSort";

/** The search in a page address's query string, e.g. `?q=Chislehurst`, or "" when there's none. */
export function searchFromUrl(query: string): string {
  return new URLSearchParams(query).get(SEARCH_PARAM)?.trim() ?? "";
}

/** `href` with its search set to `search`, or taken out when it's blank. */
export function urlWithSearch(href: string, search: string): string {
  const url = new URL(href);
  if (search.trim()) url.searchParams.set(SEARCH_PARAM, search.trim());
  else url.searchParams.delete(SEARCH_PARAM);
  return url.pathname + url.search + url.hash;
}

const isSort = (value: unknown): value is LeadSort =>
  LEAD_SORTS.some((option) => option.value === value);

/** The sort this device last chose, or newest first. Storage can be blocked, so it never throws. */
export function loadSort(storage: Pick<Storage, "getItem"> | undefined): LeadSort {
  try {
    const saved = storage?.getItem(SORT_KEY);
    return isSort(saved) ? saved : "newest";
  } catch {
    return "newest";
  }
}

/** Remembers the sort on this device, if storage allows. */
export function saveSort(storage: Pick<Storage, "setItem"> | undefined, sort: LeadSort): void {
  try {
    storage?.setItem(SORT_KEY, sort);
  } catch {
    // Private browsing or blocked storage: the sort just isn't remembered.
  }
}
