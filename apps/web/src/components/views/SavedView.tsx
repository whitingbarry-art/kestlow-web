import type { LeadsState } from "../../hooks/useLeads";
import { LeadList } from "../leads/LeadList";
import { ErrorState } from "../ui/ErrorState";
import { LoadingState } from "../ui/LoadingState";
import { PageHeader } from "../ui/PageHeader";

interface SavedViewProps {
  leads: LeadsState;
  cardsClickable: boolean;
}

export function SavedView({ leads, cardsClickable }: SavedViewProps) {
  const { savedStatus } = leads;

  return (
    <section>
      <PageHeader title="Saved leads" subtitle="Leads you've bookmarked" />
      {savedStatus.isError ? (
        <ErrorState message="Saved leads couldn't be loaded." onRetry={savedStatus.retry} />
      ) : savedStatus.isPending ? (
        <LoadingState message="Loading saved leads…" />
      ) : (
        <LeadList
          leads={leads.savedLeads}
          emptyMessage="Nothing saved yet. Tap Save on a lead."
          selectedId={leads.selectedId}
          clickable={cardsClickable}
          isSaved={leads.isSaved}
          onOpen={leads.openLead}
          onToggleSave={leads.toggleSaved}
        />
      )}
    </section>
  );
}
