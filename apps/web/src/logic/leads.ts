import type { Lead, TradeFilter } from "../types/lead";

export function filterLeadsByTrade(leads: Lead[], trade: TradeFilter): Lead[] {
  if (trade === "All trades") return leads;
  return leads.filter((lead) => lead.trades.includes(trade));
}

export function countNewLeads(leads: Lead[]): number {
  return leads.filter((lead) => lead.isNew).length;
}

export function formatLeadSummary(newCount: number, radiusMiles: number): string {
  return `${newCount} new today within ${radiusMiles} miles`;
}

export function findLead(leads: Lead[], id: number | null): Lead | undefined {
  return id === null ? undefined : leads.find((lead) => lead.id === id);
}

export function toggleId(ids: ReadonlySet<number>, id: number): Set<number> {
  const next = new Set(ids);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}
