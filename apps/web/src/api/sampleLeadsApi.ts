import { SAMPLE_LEADS } from "../data/leads";
import type { Lead } from "../types/lead";
import type { LeadsApi } from "./leads";

/**
 * An in-memory stand-in for the leads API, for tests and Storybook until MSW arrives (KES-21).
 * It filters, pages and counts like the real one, keeping the order it's given.
 */
export function createSampleLeadsApi(leads: Lead[] = SAMPLE_LEADS, pageSize = 20): LeadsApi {
  return {
    listLeads({ trade, page }) {
      const matching = trade ? leads.filter((lead) => lead.trades.includes(trade)) : leads;
      return Promise.resolve({
        leads: matching.slice((page - 1) * pageSize, page * pageSize),
        page,
        pageSize,
        total: matching.length,
        newToday: matching.filter((lead) => lead.isNew).length,
      });
    },
    getLead(id) {
      return Promise.resolve(leads.find((lead) => lead.id === id) ?? null);
    },
  };
}
