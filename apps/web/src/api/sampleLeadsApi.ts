import { SAMPLE_LEADS } from "../data/leads";
import type { Lead } from "../types/lead";
import type { LeadsApi } from "./leads";

/**
 * An in-memory stand-in for the leads API, for tests and Storybook until MSW arrives (KES-21).
 * It filters, pages and counts like the real one, keeping the order it's given, and remembers
 * saved leads, most recently saved first, starting from `savedIds`, and the base postcode.
 */
export function createSampleLeadsApi(
  leads: Lead[] = SAMPLE_LEADS,
  pageSize = 20,
  savedIds: string[] = [],
  basePostcode: string | null = null,
): LeadsApi {
  let saved = [...savedIds];
  let base = basePostcode;
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
    getBasePostcode() {
      return Promise.resolve(base);
    },
    setBasePostcode(postcode) {
      // Tidies and checks like the real API; ZZ9 9ZZ stands in for a postcode that doesn't exist.
      const match = /^([A-Z]{1,2}[0-9][A-Z0-9]?)([0-9][A-Z]{2})$/.exec(
        postcode.toUpperCase().replace(/\s+/g, ""),
      );
      if (!match)
        return Promise.resolve({ ok: false, message: "Enter a UK postcode, like BR1 1AA." });
      const tidy = `${match[1]} ${match[2]}`;
      if (tidy === "ZZ9 9ZZ")
        return Promise.resolve({
          ok: false,
          message: `We can't find ${tidy}. Check it and try again.`,
        });
      base = tidy;
      return Promise.resolve({ ok: true, postcode: tidy });
    },
  };
}
