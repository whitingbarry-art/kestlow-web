import type { LeadsState } from "../../hooks/useLeads";
import { LeadList } from "../leads/LeadList";
import { TradeFilters } from "../leads/TradeFilters";
import { Button } from "../ui/Button";
import { ErrorState } from "../ui/ErrorState";
import { LoadingState } from "../ui/LoadingState";
import { PageHeader } from "../ui/PageHeader";

interface LeadsViewProps {
  leads: LeadsState;
  cardsClickable: boolean;
}

export function LeadsView({ leads, cardsClickable }: LeadsViewProps) {
  const { leadsStatus } = leads;

  return (
    <section>
      <PageHeader title="New leads near you" subtitle={leads.summary} />
      <TradeFilters options={leads.tradeFilters} active={leads.trade} onSelect={leads.setTrade} />
      {leadsStatus.isPending ? (
        <LoadingState message="Loading leads…" />
      ) : leadsStatus.isError ? (
        <ErrorState message="Leads couldn't be loaded." onRetry={leadsStatus.retry} />
      ) : (
        <>
          <LeadList
            leads={leads.visibleLeads}
            emptyMessage="No leads for this trade yet."
            selectedId={leads.selectedId}
            clickable={cardsClickable}
            isSaved={leads.isSaved}
            onOpen={leads.openLead}
            onToggleSave={leads.toggleSaved}
          />
          {leads.hasMoreLeads && (
            <div className="mx-4 my-4">
              {leads.loadMoreFailed && !leads.isLoadingMoreLeads && (
                <p role="alert" className="mt-0 mb-3 text-center">
                  More leads couldn't be loaded.
                </p>
              )}
              <Button
                variant="ghost"
                className="w-full"
                disabled={leads.isLoadingMoreLeads}
                onClick={leads.loadMoreLeads}
              >
                {leads.isLoadingMoreLeads
                  ? "Loading…"
                  : leads.loadMoreFailed
                    ? "Try again"
                    : "Show more leads"}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
