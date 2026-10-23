export type Trade = "Roofing" | "Electrical" | "Landscaping" | "Groundworks";

export type TradeFilter = "All trades" | Trade;

/** A planning application as the API returns it. Dates are YYYY-MM-DD. */
export interface Lead {
  id: string;
  reference: string;
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
  sourceUrl: string;
  location: { lat: number; lng: number };
}

/** One page of `GET /leads`: newest first, with the total and how many were received today. */
export interface LeadsPage {
  leads: Lead[];
  page: number;
  pageSize: number;
  total: number;
  newToday: number;
}
