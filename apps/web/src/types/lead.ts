export type Trade = "Roofing" | "Electrical" | "Landscaping" | "Groundworks";

export type TradeFilter = "All trades" | Trade;

export interface Lead {
  id: number;
  address: string;
  council: string;
  miles: number;
  isNew: boolean;
  received: string;
  applicationType: string;
  trades: Trade[];
  description: string;
  reference: string;
  decisionDue: string;
  applicant: string;
}
