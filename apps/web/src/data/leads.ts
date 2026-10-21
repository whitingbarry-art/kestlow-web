import type { Lead, Trade, TradeFilter } from "../types/lead";

export const TRADES: Trade[] = ["Roofing", "Electrical", "Landscaping", "Groundworks"];

export const TRADE_FILTERS: TradeFilter[] = ["All trades", ...TRADES];

export const SEARCH_RADIUS_MILES = 15;

export const INITIAL_SAVED_IDS: number[] = [3];

export const LEADS: Lead[] = [
  {
    id: 1,
    address: "14 Orchard Lane",
    council: "Example Borough Council",
    miles: 2.1,
    isNew: true,
    received: "Today",
    applicationType: "Householder",
    trades: ["Roofing"],
    description: "Single-storey rear extension and loft conversion with new roof lights.",
    reference: "EX/26/01482",
    decisionDue: "18 Dec 2026",
    applicant: "Private householder (sample)",
  },
  {
    id: 2,
    address: "Land at Mill Road",
    council: "Sample District Council",
    miles: 6.4,
    isNew: true,
    received: "Today",
    applicationType: "Full planning",
    trades: ["Groundworks", "Electrical"],
    description: "Erection of four detached dwellings with access road and landscaping.",
    reference: "SD/26/00977",
    decisionDue: "02 Jan 2027",
    applicant: "Example Homes Ltd (sample)",
  },
  {
    id: 3,
    address: "3 The Green",
    council: "Demo City Council",
    miles: 11.8,
    isNew: false,
    received: "Yesterday",
    applicationType: "Householder",
    trades: ["Landscaping"],
    description: "Garden room, patio and new boundary wall to rear garden.",
    reference: "DC/26/03310",
    decisionDue: "12 Dec 2026",
    applicant: "Private householder (sample)",
  },
  {
    id: 4,
    address: "Unit 6, Foundry Park",
    council: "Example Borough Council",
    miles: 9.2,
    isNew: false,
    received: "2 days ago",
    applicationType: "Change of use",
    trades: ["Electrical"],
    description:
      "Change of use from storage to light industrial with new electrical supply and external lighting.",
    reference: "EX/26/01455",
    decisionDue: "20 Dec 2026",
    applicant: "Foundry Park Estates (sample)",
  },
];
