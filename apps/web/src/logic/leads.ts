import type { Lead } from "../types/lead";

export function formatLeadSummary(newCount: number, radiusMiles: number): string {
  return `${newCount} new today within ${radiusMiles} miles`;
}

export function findLead(leads: Lead[], id: string | null): Lead | undefined {
  return id === null ? undefined : leads.find((lead) => lead.id === id);
}

export function toggleId(ids: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(ids);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}
