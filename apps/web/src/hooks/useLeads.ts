import { useCallback, useMemo, useState } from "react";
import { INITIAL_SAVED_IDS, LEADS, SEARCH_RADIUS_MILES, TRADE_FILTERS } from "../data/leads";
import {
  countNewLeads,
  filterLeadsByTrade,
  findLead,
  formatLeadSummary,
  toggleId,
} from "../logic/leads";
import type { Lead, TradeFilter } from "../types/lead";

interface UseLeadsOptions {
  leads?: Lead[];
  initialSavedIds?: number[];
  selectFirstLead?: boolean;
}

export function useLeads({
  leads = LEADS,
  initialSavedIds = INITIAL_SAVED_IDS,
  selectFirstLead = false,
}: UseLeadsOptions = {}) {
  const [trade, setTrade] = useState<TradeFilter>("All trades");
  const [savedIds, setSavedIds] = useState<Set<number>>(() => new Set(initialSavedIds));
  const [selectedId, setSelectedId] = useState<number | null>(() =>
    selectFirstLead ? (leads[0]?.id ?? null) : null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);

  const visibleLeads = useMemo(() => filterLeadsByTrade(leads, trade), [leads, trade]);
  const savedLeads = useMemo(
    () => leads.filter((lead) => savedIds.has(lead.id)),
    [leads, savedIds],
  );
  const summary = formatLeadSummary(countNewLeads(visibleLeads), SEARCH_RADIUS_MILES);
  const selectedLead = findLead(leads, selectedId);

  const isSaved = useCallback((id: number) => savedIds.has(id), [savedIds]);
  const toggleSaved = useCallback((id: number) => setSavedIds((ids) => toggleId(ids, id)), []);

  const openLead = useCallback((id: number) => {
    setSelectedId(id);
    setIsDetailOpen(true);
    setOpenCount((count) => count + 1);
  }, []);

  const closeDetail = useCallback(() => setIsDetailOpen(false), []);

  return {
    tradeFilters: TRADE_FILTERS,
    trade,
    setTrade,
    visibleLeads,
    savedLeads,
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
