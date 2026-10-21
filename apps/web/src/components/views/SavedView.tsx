import type { LeadsState } from "../../hooks/useLeads";
import { LeadList } from "../leads/LeadList";
import { PageHeader } from "../ui/PageHeader";

interface SavedViewProps {
  leads: LeadsState;
  cardsClickable: boolean;
}

export function SavedView({ leads, cardsClickable }: SavedViewProps) {
  return (
    <section>
      <PageHeader title="Saved leads" subtitle="Leads you've bookmarked" />
      <LeadList
        leads={leads.savedLeads}
        emptyMessage="Nothing saved yet. Tap Save on a lead."
        selectedId={leads.selectedId}
        clickable={cardsClickable}
        isSaved={leads.isSaved}
        onOpen={leads.openLead}
        onToggleSave={leads.toggleSaved}
      />
    </section>
  );
}
