import type { LeadsState } from "../../hooks/useLeads";
import { LeadList } from "../leads/LeadList";
import { TradeFilters } from "../leads/TradeFilters";
import { PageHeader } from "../ui/PageHeader";

interface LeadsViewProps {
  leads: LeadsState;
  cardsClickable: boolean;
}

export function LeadsView({ leads, cardsClickable }: LeadsViewProps) {
  return (
    <section>
      <PageHeader title="New leads near you" subtitle={leads.summary} />
      <TradeFilters options={leads.tradeFilters} active={leads.trade} onSelect={leads.setTrade} />
      <LeadList
        leads={leads.visibleLeads}
        emptyMessage="No leads for this trade yet."
        selectedId={leads.selectedId}
        clickable={cardsClickable}
        isSaved={leads.isSaved}
        onOpen={leads.openLead}
        onToggleSave={leads.toggleSaved}
      />
    </section>
  );
}
