import type { Lead, LeadSort } from "../types/lead";

export function formatLeadSummary(newCount: number, radiusMiles: number): string {
  return `${newCount} new today within ${radiusMiles} miles`;
}

/** How far away a lead is: "about" when its location is only rough (KES-28). */
export function formatLeadDistance({ miles, approximate }: Pick<Lead, "miles" | "approximate">) {
  return `${approximate ? "about " : ""}${miles} ${miles === 1 ? "mile" : "miles"}`;
}

export function findLead(leads: Lead[], id: string | null): Lead | undefined {
  return id === null ? undefined : leads.find((lead) => lead.id === id);
}

const squash = (text: string) => text.toLowerCase().replace(/\s+/g, "");

/** Like the API's search: the address or council contains it, ignoring case and spaces. */
export function matchesSearch(lead: Lead, search: string): boolean {
  const wanted = squash(search);
  return squash(lead.address).includes(wanted) || squash(lead.council).includes(wanted);
}

/** Like the API's sorts, for the sample API: newest keeps the order given. */
export function sortLeads(leads: Lead[], sort: LeadSort): Lead[] {
  if (sort === "nearest") return [...leads].sort((a, b) => a.miles - b.miles);
  if (sort === "decision")
    return [...leads].sort((a, b) =>
      (a.decisionDue ?? "9999-12-31").localeCompare(b.decisionDue ?? "9999-12-31"),
    );
  return leads;
}
