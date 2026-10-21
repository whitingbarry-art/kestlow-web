import type { Lead } from "../../types/lead";
import { Tag } from "../ui/Tag";

interface LeadTagsProps {
  lead: Lead;
  showReceived?: boolean;
}

export function LeadTags({ lead, showReceived = false }: LeadTagsProps) {
  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      {lead.trades.map((trade) => (
        <Tag key={trade} match>
          {trade} match
        </Tag>
      ))}
      <Tag>{lead.applicationType}</Tag>
      {showReceived && <Tag>{lead.received}</Tag>}
    </div>
  );
}
