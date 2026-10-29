import type { Lead, LeadSort } from "../types/lead";

const wholeNumber = new Intl.NumberFormat("en-GB");

/**
 * The line under "New leads near you": how many are new today out of how many in all, such as
 * "2 new today, of 3,456 leads within 10 miles", leaving out "0 new today" (KES-120).
 */
export function formatLeadSummary(newCount: number, total: number, radiusMiles: number): string {
  const within = `within ${radiusMiles} ${radiusMiles === 1 ? "mile" : "miles"}`;
  if (total === 0) return `No leads ${within} yet`;
  const leads = `${wholeNumber.format(total)} ${total === 1 ? "lead" : "leads"} ${within}`;
  return newCount > 0 ? `${wholeNumber.format(newCount)} new today, of ${leads}` : leads;
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
