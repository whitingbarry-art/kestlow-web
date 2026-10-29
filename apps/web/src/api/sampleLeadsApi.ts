import { DEFAULT_DELIVERY } from "../data/alerts";
import { SAMPLE_LEADS, TRADES } from "../data/leads";
import { matchesSearch, sortLeads } from "../logic/leads";
import type { Lead } from "../types/lead";
import type { AlertSettings, LeadsApi } from "./leads";

/** Bromley town centre, the API's default base, which the sample leads are placed around. */
const SAMPLE_BASE = { lat: 51.4057, lng: 0.0144 };

/**
 * An in-memory stand-in for the leads API, for tests and Storybook until MSW arrives (KES-21).
 * It filters, searches, sorts, pages and counts like the real one (newest keeps the order it's
 * given), and remembers saved leads, most recently saved first, starting from `savedIds`, and
 * alert settings. It can't look postcodes up, so the base stays at Bromley whatever postcode is
 * set.
 */
export function createSampleLeadsApi(
  leads: Lead[] = SAMPLE_LEADS,
  pageSize = 20,
  savedIds: string[] = [],
  basePostcode: string | null = null,
): LeadsApi {
  let saved = [...savedIds];
  let settings: AlertSettings = {
    postcode: basePostcode,
    radiusMiles: 15,
    base: SAMPLE_BASE,
    trades: [...TRADES],
    delivery: DEFAULT_DELIVERY,
  };
  return {
    listLeads({ trade, search, sort = "newest", page }) {
      const matching = sortLeads(
        leads.filter(
          (lead) =>
            (!trade || lead.trades.includes(trade)) && (!search || matchesSearch(lead, search)),
        ),
        sort,
      );
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
    // Push is switched on; subscriptions are kept but go nowhere.
    // web-push's documented example key: a real P-256 public key that nothing can push with.
    getPushKey: () =>
      Promise.resolve(
        "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U",
      ),
    subscribePush: () => Promise.resolve(),
    unsubscribePush: () => Promise.resolve(),
    getAlertSettings() {
      return Promise.resolve(settings);
    },
    updateAlertSettings({ postcode, radiusMiles, trades, delivery }) {
      // Checks everything before changing anything, like the real API.
      const refuse = (message: string) => Promise.resolve({ ok: false as const, message });
      if (
        radiusMiles !== undefined &&
        (!Number.isInteger(radiusMiles) || radiusMiles < 1 || radiusMiles > 50)
      )
        return refuse("Choose a distance from 1 to 50 miles.");
      let tidy: string | undefined;
      if (postcode !== undefined) {
        // ZZ9 9ZZ stands in for a postcode that doesn't exist.
        const match = /^([A-Z]{1,2}[0-9][A-Z0-9]?)([0-9][A-Z]{2})$/.exec(
          postcode.toUpperCase().replace(/\s+/g, ""),
        );
        if (!match) return refuse("Enter a UK postcode, like BR1 1AA.");
        tidy = `${match[1]} ${match[2]}`;
        if (tidy === "ZZ9 9ZZ") return refuse(`We can't find ${tidy}. Check it and try again.`);
      }
      settings = {
        ...settings,
        ...(tidy !== undefined && { postcode: tidy }),
        ...(radiusMiles !== undefined && { radiusMiles }),
        // Kept in the usual order, each once, like the real API.
        ...(trades && { trades: TRADES.filter((t) => trades.includes(t)) }),
        ...(delivery && { delivery }),
      };
      return Promise.resolve({ ok: true, settings });
    },
  };
}
