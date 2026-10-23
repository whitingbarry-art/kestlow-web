import { useInfiniteQuery, useQueries, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useLeadsApi } from "../api/LeadsApiContext";
import { SEARCH_RADIUS_MILES, TRADE_FILTERS } from "../data/leads";
import { findLead, formatLeadSummary, toggleId } from "../logic/leads";
import type { Lead, TradeFilter } from "../types/lead";

interface UseLeadsOptions {
  initialSavedIds?: string[];
  selectFirstLead?: boolean;
}

/** Whether a list has loaded, and a way to try again when it hasn't. */
export interface LoadStatus {
  isPending: boolean;
  isError: boolean;
  retry: () => void;
}

export function useLeads({ initialSavedIds = [], selectFirstLead = false }: UseLeadsOptions = {}) {
  const api = useLeadsApi();
  const [trade, setTrade] = useState<TradeFilter>("All trades");
  // Saved leads live in memory until accounts can store them (KES-24).
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set(initialSavedIds));
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);

  const leadsQuery = useInfiniteQuery({
    queryKey: ["leads", trade],
    queryFn: ({ pageParam }) =>
      api.listLeads({ trade: trade === "All trades" ? undefined : trade, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page * last.pageSize < last.total ? last.page + 1 : undefined,
  });
  const visibleLeads = useMemo(
    () => leadsQuery.data?.pages.flatMap((page) => page.leads) ?? [],
    [leadsQuery.data],
  );
  const newToday = leadsQuery.data?.pages[0]?.newToday;
  const summary =
    newToday === undefined
      ? `Within ${SEARCH_RADIUS_MILES} miles`
      : formatLeadSummary(newToday, SEARCH_RADIUS_MILES);
  const { refetch } = leadsQuery;
  const retryLeads = useCallback(() => void refetch(), [refetch]);
  const leadsStatus: LoadStatus = {
    isPending: leadsQuery.isPending,
    // A failed "Show more" keeps the leads already shown; loadMoreFailed reports it instead.
    isError: leadsQuery.isError && !leadsQuery.isFetchNextPageError,
    retry: retryLeads,
  };

  // Each saved lead is fetched by id, so it stays listed whatever trade or page is showing.
  const saved = useQueries({
    queries: [...savedIds].map((id) => ({
      queryKey: ["lead", id],
      queryFn: () => api.getLead(id),
      initialData: () => findLead(visibleLeads, id),
    })),
    combine: (results) => ({
      // A lead that has gone from the area comes back as null and drops off the list.
      leads: results.flatMap((result) => (result.data ? [result.data] : [])),
      status: {
        isPending: results.some((result) => result.isPending),
        isError: results.some((result) => result.isError),
        retry: () => results.forEach((result) => result.isError && void result.refetch()),
      } satisfies LoadStatus,
    }),
  });

  // On desktop the first lead shows in the detail panel until another is chosen.
  const selectedId = chosenId ?? (selectFirstLead ? (visibleLeads[0]?.id ?? null) : null);
  const listedLead = findLead(visibleLeads, selectedId) ?? findLead(saved.leads, selectedId);
  // A chosen lead stays in the detail panel after a trade change takes it off the list.
  const chosenQuery = useQuery({
    queryKey: ["lead", chosenId],
    queryFn: () => (chosenId === null ? null : api.getLead(chosenId)),
    enabled: chosenId !== null && !listedLead,
    initialData: () => findLead(visibleLeads, chosenId) ?? findLead(saved.leads, chosenId),
  });
  const selectedLead: Lead | undefined = listedLead ?? chosenQuery.data ?? undefined;

  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);
  const toggleSaved = useCallback((id: string) => setSavedIds((ids) => toggleId(ids, id)), []);

  const openLead = useCallback((id: string) => {
    setChosenId(id);
    setIsDetailOpen(true);
    setOpenCount((count) => count + 1);
  }, []);

  const closeDetail = useCallback(() => setIsDetailOpen(false), []);

  const { fetchNextPage } = leadsQuery;
  const loadMoreLeads = useCallback(() => void fetchNextPage(), [fetchNextPage]);

  return {
    tradeFilters: TRADE_FILTERS,
    trade,
    setTrade,
    visibleLeads,
    leadsStatus,
    hasMoreLeads: leadsQuery.hasNextPage,
    isLoadingMoreLeads: leadsQuery.isFetchingNextPage,
    loadMoreFailed: leadsQuery.isFetchNextPageError,
    loadMoreLeads,
    savedLeads: saved.leads,
    savedStatus: saved.status,
    summary,
    selectedId,
    selectedLead,
    isDetailOpen,
    openCount,
    isSaved,
    toggleSaved,
    openLead,
    closeDetail,
  };
}

export type LeadsState = ReturnType<typeof useLeads>;
