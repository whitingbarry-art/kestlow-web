import type { Trade } from "../types/lead";
import { TRADES } from "./leads";

/** The jobs page (KES-155), where the ads and cards point. */
export const JOBS_PATH = "/jobs";

/** The jobs page with the card or ad's code, so we still see where people came from. */
export function jobsHref(source?: string): string {
  return source ? `${JOBS_PATH}?ref=${encodeURIComponent(source)}` : JOBS_PATH;
}

/** Which trade each trade group's code is for (KES-160): fb-roofers is a roofers' group, say. */
const GROUP_TRADES: Record<string, Trade> = {
  roofers: "Roofing",
  electricians: "Electrical",
  landscapers: "Landscaping",
  groundworks: "Groundworks",
};

/**
 * The trade to pick on the jobs page before they tap anything (KES-160): ?trade=, or the trade
 * of the group a link was posted in, so a roofer from a roofers' group has one step fewer.
 */
export function tradeFrom(search: string): Trade | undefined {
  const params = new URLSearchParams(search);
  const named = params.get("trade")?.toLowerCase();
  const trade = TRADES.find((option) => option.toLowerCase() === named);
  if (trade) return trade;
  const group = params.get("ref")?.toLowerCase().split("-").pop();
  return group ? GROUP_TRADES[group] : undefined;
}
