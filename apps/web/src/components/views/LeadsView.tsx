import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLeadsApi } from "../../api/LeadsApiContext";
import { TRADES } from "../../data/leads";
import { alertSettingsQuery } from "../../hooks/useAlertSettings";
import type { LeadsState } from "../../hooks/useLeads";
import { useSubscription } from "../../hooks/useSubscription";
import type { TradeFilter } from "../../types/lead";
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
  const trades = useTradeButtons(leads);

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
      <TradeFilters
        options={trades.options}
        active={trades.active}
        onSelect={trades.select}
        locked={trades.locked}
        onSelectLocked={trades.explain}
      />
      {trades.explained && (
        <p role="status" className="mx-4 mt-0 mb-1 text-sm text-ink desk:mx-6">
          {trades.explained} isn't on your plan. Pro covers all four trades.{" "}
          <a href="/pricing" className="font-semibold text-ink underline">
            See plans
          </a>
        </p>
      )}
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

/**
 * The trade buttons as someone's plan allows (KES-52). Pro sees every trade and "All trades". A
 * plan with fewer shows only theirs, with no "All trades" when there's one, since it would show
 * the same leads, and the rest after them with a padlock that says why.
 */
function useTradeButtons(leads: LeadsState) {
  const settings = useQuery(alertSettingsQuery(useLeadsApi())).data;
  const [explained, setExplained] = useState<TradeFilter | null>(null);
  const limits = settings?.limits;
  // The trades the plan covers, or null when it covers them all.
  const allowed =
    settings && limits && limits.maxTrades < TRADES.length
      ? settings.trades.length
        ? settings.trades
        : TRADES.slice(0, limits.maxTrades)
      : null;
  const { trade, setTrade } = leads;
  // A trade filter from before the plan changed, that the plan doesn't cover, would only ever
  // show nothing, so it goes back to all of theirs.
  useEffect(() => {
    if (allowed && trade !== "All trades" && !allowed.includes(trade)) setTrade("All trades");
  }, [allowed, trade, setTrade]);
  if (!allowed)
    return {
      options: leads.tradeFilters,
      active: leads.trade,
      select: leads.setTrade,
      locked: [],
      explain: () => {},
      explained: null,
    };

  const one = allowed.length === 1;
  return {
    options: (one ? allowed : ["All trades", ...allowed]) as TradeFilter[],
    // With one trade, every lead is that trade's, so its button shows as chosen.
    active: one ? allowed[0] : leads.trade,
    select: (trade: TradeFilter) => {
      setExplained(null);
      leads.setTrade(one ? "All trades" : trade);
    },
    locked: TRADES.filter((trade) => !allowed.includes(trade)),
    explain: setExplained,
    explained,
  };
}
