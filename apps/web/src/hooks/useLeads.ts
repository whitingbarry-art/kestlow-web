import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLeadsApi } from "../api/LeadsApiContext";
import { LEAD_SORTS, SEARCH_RADIUS_MILES, TRADE_FILTERS } from "../data/leads";
import { findLead, formatLeadSummary } from "../logic/leads";
import { loadSort, saveSort, searchFromUrl, urlWithSearch } from "../logic/leadSearch";
import { alertSettingsQuery } from "./useAlertSettings";
import type { Lead, LeadSort, TradeFilter } from "../types/lead";

interface UseLeadsOptions {
  selectFirstLead?: boolean;
}

/** The signed-in user's saved leads, kept by the API so they show on every device (KES-24). */
export const SAVED_KEY = ["saved"] as const;

const NO_LEADS: Lead[] = [];

/** How long typing has to pause before the search is sent, so each letter isn't a request. */
export const SEARCH_DELAY_MS = 300;

/** This device's storage, or undefined where the browser blocks it. */
function deviceStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

/** Whether a list has loaded, and a way to try again when it hasn't. */
export interface LoadStatus {
  isPending: boolean;
  isError: boolean;
  retry: () => void;
}

export function useLeads({ selectFirstLead = false }: UseLeadsOptions = {}) {
  const api = useLeadsApi();
  const queryClient = useQueryClient();
  // The person's own distance (KES-25), or the usual 15 miles while it loads.
  const radiusMiles = useQuery(alertSettingsQuery(api)).data?.radiusMiles ?? SEARCH_RADIUS_MILES;
  const [trade, setTrade] = useState<TradeFilter>("All trades");
  // What's typed in the search box, and the search sent once typing pauses (KES-115). It starts
  // from the address bar, so a bookmarked or shared search opens with its results.
  const [searchText, setSearchText] = useState(() => searchFromUrl(window.location.search));
  const [search, setSearch] = useState(searchText);
  const [sort, setSortState] = useState<LeadSort>(() => loadSort(deviceStorage()));
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Keeps the search in the address bar without adding a Back step for every search.
  useEffect(() => {
    window.history.replaceState(
      window.history.state,
      "",
      urlWithSearch(window.location.href, search),
    );
  }, [search]);

  const clearSearch = useCallback(() => {
    setSearchText("");
    setSearch("");
  }, []);

  const setSort = useCallback((next: LeadSort) => {
    setSortState(next);
    saveSort(deviceStorage(), next);
  }, []);

  const leadsQuery = useInfiniteQuery({
    queryKey: ["leads", trade, search, sort],
    queryFn: ({ pageParam }) =>
      api.listLeads({
        trade: trade === "All trades" ? undefined : trade,
        search: search || undefined,
        sort,
        page: pageParam,
      }),
    // The last results stay up while new ones load, so the list doesn't flash as you type.
    placeholderData: keepPreviousData,
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page * last.pageSize < last.total ? last.page + 1 : undefined,
  });
  const visibleLeads = useMemo(
    () => leadsQuery.data?.pages.flatMap((page) => page.leads) ?? [],
    [leadsQuery.data],
  );
  const newToday = leadsQuery.data?.pages[0]?.newToday;
  // While a new search loads, the last results stay up, but not their count (KES-120).
  const total = leadsQuery.isPlaceholderData ? undefined : leadsQuery.data?.pages[0]?.total;
  const summary =
    newToday === undefined || total === undefined
      ? `Within ${radiusMiles} ${radiusMiles === 1 ? "mile" : "miles"}`
      : formatLeadSummary(newToday, total, radiusMiles);
  const { refetch } = leadsQuery;
  const retryLeads = useCallback(() => void refetch(), [refetch]);
  const leadsStatus: LoadStatus = {
    isPending: leadsQuery.isPending,
    // A failed "Show more" keeps the leads already shown; loadMoreFailed reports it instead.
    isError: leadsQuery.isError && !leadsQuery.isFetchNextPageError,
    retry: retryLeads,
  };

  const savedQuery = useQuery({ queryKey: SAVED_KEY, queryFn: () => api.listSaved() });
  const savedLeads = savedQuery.data ?? NO_LEADS;
  const savedIds = useMemo(() => new Set(savedLeads.map((lead) => lead.id)), [savedLeads]);
  const { refetch: refetchSaved } = savedQuery;
  const retrySaved = useCallback(() => void refetchSaved(), [refetchSaved]);
  const savedStatus: LoadStatus = {
    isPending: savedQuery.isPending,
    isError: savedQuery.isError,
    retry: retrySaved,
  };

  // Saving shows straight away, and is put back if the API refuses or can't be reached.
  const { mutate: changeSaved } = useMutation({
    mutationFn: ({ id, save }: { id: string; save: boolean; lead?: Lead }) =>
      save ? api.saveLead(id) : api.unsaveLead(id),
    onMutate: async ({ id, save, lead }) => {
      await queryClient.cancelQueries({ queryKey: SAVED_KEY });
      const previous = queryClient.getQueryData<Lead[]>(SAVED_KEY);
      queryClient.setQueryData<Lead[]>(SAVED_KEY, (leads = []) => {
        const others = leads.filter((saved) => saved.id !== id);
        return save && lead ? [lead, ...others] : others;
      });
      return { previous };
    },
    onError: (_error, _change, context) => queryClient.setQueryData(SAVED_KEY, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: SAVED_KEY }),
  });

  // On desktop the first lead shows in the detail panel until another is chosen.
  const selectedId = chosenId ?? (selectFirstLead ? (visibleLeads[0]?.id ?? null) : null);
  const listedLead = findLead(visibleLeads, selectedId) ?? findLead(savedLeads, selectedId);
  // A chosen lead stays in the detail panel after a trade change takes it off the list.
  const chosenQuery = useQuery({
    queryKey: ["lead", chosenId],
    queryFn: () => (chosenId === null ? null : api.getLead(chosenId)),
    enabled: chosenId !== null && !listedLead,
    initialData: () => findLead(visibleLeads, chosenId) ?? findLead(savedLeads, chosenId),
  });
  const selectedLead: Lead | undefined = listedLead ?? chosenQuery.data ?? undefined;

  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);
  const toggleSaved = useCallback(
    (id: string) => {
      const lead =
        findLead(visibleLeads, id) ??
        findLead(savedLeads, id) ??
        (selectedLead?.id === id ? selectedLead : undefined);
      changeSaved({ id, save: !savedIds.has(id), lead });
    },
    [visibleLeads, savedLeads, selectedLead, savedIds, changeSaved],
  );

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
    searchText,
    setSearchText,
    search,
    clearSearch,
    sortOptions: LEAD_SORTS,
    sort,
    setSort,
    total,
    visibleLeads,
    leadsStatus,
    hasMoreLeads: leadsQuery.hasNextPage,
    isLoadingMoreLeads: leadsQuery.isFetchingNextPage,
    loadMoreFailed: leadsQuery.isFetchNextPageError,
    loadMoreLeads,
    savedLeads,
    savedStatus,
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
