import type { Lead } from "../../types/lead";
import { EmptyState } from "../ui/EmptyState";
import { LeadCard } from "./LeadCard";

interface LeadListProps {
  leads: Lead[];
  emptyMessage: string;
  selectedId: string | null;
  clickable: boolean;
  isSaved: (id: string) => boolean;
  onOpen: (id: string) => void;
  onToggleSave: (id: string) => void;
}

export function LeadList({
  leads,
  emptyMessage,
  selectedId,
  clickable,
  isSaved,
  onOpen,
  onToggleSave,
}: LeadListProps) {
  if (leads.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <div>
      {leads.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          selected={lead.id === selectedId}
          saved={isSaved(lead.id)}
          clickable={clickable}
          onOpen={onOpen}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
}
