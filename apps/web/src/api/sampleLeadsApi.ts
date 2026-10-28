import { SAMPLE_LEADS } from "../data/leads";
import type { Lead } from "../types/lead";
import type { LeadsApi } from "./leads";

/**
 * An in-memory stand-in for the leads API, for tests and Storybook until MSW arrives (KES-21).
 * It filters, pages and counts like the real one, keeping the order it's given, and remembers
 * saved leads, most recently saved first, starting from `savedIds`.
 */
export function createSampleLeadsApi(
  leads: Lead[] = SAMPLE_LEADS,
  pageSize = 20,
  savedIds: string[] = [],
): LeadsApi {
  let saved = [...savedIds];
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
    listSaved() {
      // Like the real API, a saved lead that's no longer a lead drops off.
      return Promise.resolve(saved.flatMap((id) => leads.find((lead) => lead.id === id) ?? []));
    },
    saveLead(id) {
      if (!leads.some((lead) => lead.id === id)) return Promise.reject(new Error("No such lead."));
      saved = [id, ...saved.filter((savedId) => savedId !== id)];
      return Promise.resolve();
    },
    unsaveLead(id) {
      saved = saved.filter((savedId) => savedId !== id);
      return Promise.resolve();
    },
  };
}
