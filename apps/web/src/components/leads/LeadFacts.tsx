import { formatDate, formatReceived } from "../../logic/dates";
import type { Lead } from "../../types/lead";

interface LeadFactsProps {
  lead: Lead;
}

export function LeadFacts({ lead }: LeadFactsProps) {
  // The free plan doesn't get these (KES-52); a paid plan shows them.
  const hidden = "With Solo or Pro";
  const facts: Array<[string, string]> = [
    ["Reference", lead.masked ? hidden : (lead.reference ?? "Not given")],
    ["Applicant", lead.masked ? hidden : (lead.applicant ?? "Not given")],
    ["Received", formatReceived(lead.receivedAt)],
    ["Decision due", lead.decisionDue ? formatDate(lead.decisionDue) : "Not set"],
  ];

  return (
    <dl className="my-3 rounded-card bg-card px-4 py-1 shadow-card">
      {facts.map(([label, value]) => (
        <div
          key={label}
          className="flex justify-between gap-3 border-b border-line py-3 text-sm last:border-b-0"
        >
          <dt className="text-muted">{label}</dt>
          <dd className="m-0 text-right font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
