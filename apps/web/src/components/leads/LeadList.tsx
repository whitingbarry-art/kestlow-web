import type { Lead } from "../../types/lead";
import { EmptyState } from "../ui/EmptyState";
import { LeadCard } from "./LeadCard";

interface LeadListProps {
  leads: Lead[];
  emptyMessage: string;
  selectedId: number | null;
  clickable: boolean;
  isSaved: (id: number) => boolean;
  onOpen: (id: number) => void;
  onToggleSave: (id: number) => void;
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
