import type { LeadsState } from "../../hooks/useLeads";
import { useSubscription } from "../../hooks/useSubscription";
import { LeadList } from "../leads/LeadList";
import { LeadSearch } from "../leads/LeadSearch";
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
  const { leadsStatus, search } = leads;
  const noMatches = Boolean(search) && leads.visibleLeads.length === 0;
  const free = useSubscription().data?.plan === "free";

  return (
    <section>
      <PageHeader title="New leads near you" subtitle={leads.summary} />
      <LeadSearch
        text={leads.searchText}
        onTextChange={leads.setSearchText}
        onClear={leads.clearSearch}
        search={search}
        total={leads.total}
        sortOptions={leads.sortOptions}
        sort={leads.sort}
        onSortChange={leads.setSort}
        placeholder={free ? "Search by council or postcode area, like BR7" : undefined}
      />
      {free && (
        <p className="mx-4 mt-3 mb-0 rounded-xl bg-chip p-3 text-sm text-ink desk:mx-6">
          On the free plan, leads show a week after they're published, for one trade, with the area
          rather than the address.{" "}
          <a href="/pricing" className="font-semibold text-ink underline">
            See them first with Solo or Pro
          </a>
        </p>
      )}
      <TradeFilters options={leads.tradeFilters} active={leads.trade} onSelect={leads.setTrade} />
      {leadsStatus.isPending ? (
        <LoadingState message="Loading leads…" />
      ) : leadsStatus.isError ? (
        <ErrorState message="Leads couldn't be loaded." onRetry={leadsStatus.retry} />
      ) : (
        <>
          {noMatches ? (
            <div className="mx-4 my-6 text-center">
              <p className="m-0 text-muted">
                No leads match “{search}”{leads.trade === "All trades" ? "" : ` for ${leads.trade}`}
                .
              </p>
              <Button variant="ghost" className="mt-3" onClick={leads.clearSearch}>
                Clear search
              </Button>
            </div>
          ) : (
            <LeadList
              leads={leads.visibleLeads}
              emptyMessage="No leads for this trade yet."
              selectedId={leads.selectedId}
              clickable={cardsClickable}
              isSaved={leads.isSaved}
              onOpen={leads.openLead}
              onToggleSave={leads.toggleSaved}
            />
          )}
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
