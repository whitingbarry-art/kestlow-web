export type Trade = "Roofing" | "Electrical" | "Landscaping" | "Groundworks";

export type TradeFilter = "All trades" | Trade;

/** The orders the API can list leads in (KES-115). */
export type LeadSort = "newest" | "nearest" | "decision";

/** A planning application as the API returns it. Dates are YYYY-MM-DD. */
export interface Lead {
  id: string;
  /** The council's reference; null on the free plan, which doesn't show it (KES-52). */
  reference: string | null;
  address: string;
  council: string;
  miles: number;
  isNew: boolean;
  receivedAt: string;
  decisionDue: string | null;
  applicationType: string;
  trades: Trade[];
  description: string;
  applicant: string | null;
  /** The council's page for it; null on the free plan (KES-52). */
  sourceUrl: string | null;
  location: { lat: number; lng: number };
  /** True when the location is only rough, from the area the address names (KES-28). */
  approximate: boolean;
  /**
   * True on the free plan (KES-52): the address is only the area, the place is rough, and the
   * council link, reference and applicant aren't sent.
   */
  masked: boolean;
}

/** One page of `GET /leads`: newest first, with the total and how many were received today. */
export interface LeadsPage {
  leads: Lead[];
  page: number;
  pageSize: number;
  total: number;
  newToday: number;
}
