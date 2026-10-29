import { daysAgo } from "../logic/dates";
import type { Lead, LeadSort, Trade, TradeFilter } from "../types/lead";

export const TRADES: Trade[] = ["Roofing", "Electrical", "Landscaping", "Groundworks"];

export const TRADE_FILTERS: TradeFilter[] = ["All trades", ...TRADES];

/** The sort choices on Leads, in the order they're offered; the first is the default (KES-115). */
export const LEAD_SORTS: { value: LeadSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "nearest", label: "Nearest first" },
  { value: "decision", label: "Decision due soonest" },
];

/** The API's stand-in search area until accounts arrive: 15 miles around Bromley town centre. */
export const SEARCH_RADIUS_MILES = 15;

/**
 * Sample leads for Storybook and tests, in the API's shape. Received dates count back from
 * today, so they always read "Today", "Yesterday" and so on.
 */
export const SAMPLE_LEADS: Lead[] = [
  {
    id: "sample-1",
    reference: "EX/26/01482",
    address: "14 Orchard Lane",
    council: "Example Borough Council",
    miles: 2.1,
    isNew: true,
    receivedAt: daysAgo(0),
    decisionDue: "2026-12-18",
    applicationType: "Householder",
    trades: ["Roofing"],
    description: "Single-storey rear extension and loft conversion with new roof lights.",
    applicant: "Private householder (sample)",
    sourceUrl: "https://planning.example.gov.uk/applications/EX%2F26%2F01482",
    location: { lat: 51.4247, lng: 0.0261 },
    approximate: false,
  },
  {
    id: "sample-2",
    reference: "SD/26/00977",
    address: "Land at Mill Road",
    council: "Sample District Council",
    miles: 6.4,
    isNew: true,
    receivedAt: daysAgo(0),
    decisionDue: "2027-01-02",
    applicationType: "Full planning",
    trades: ["Groundworks", "Electrical"],
    description: "Erection of four detached dwellings with access road and landscaping.",
    applicant: "Example Homes Ltd (sample)",
    sourceUrl: "https://planning.example.gov.uk/applications/SD%2F26%2F00977",
    location: { lat: 51.3709, lng: 0.1063 },
    approximate: false,
  },
  {
    id: "sample-3",
    reference: "DC/26/03310",
    address: "3 The Green",
    council: "Demo City Council",
    miles: 11.8,
    isNew: false,
    receivedAt: daysAgo(1),
    decisionDue: "2026-12-12",
    applicationType: "Householder",
    trades: ["Landscaping"],
    description: "Garden room, patio and new boundary wall to rear garden.",
    applicant: null,
    sourceUrl: "https://planning.example.gov.uk/applications/DC%2F26%2F03310",
    location: { lat: 51.4893, lng: -0.1146 },
    approximate: false,
  },
  {
    id: "sample-4",
    reference: "EX/26/01455",
    address: "Unit 6, Foundry Park",
    council: "Example Borough Council",
    miles: 9.2,
    isNew: false,
    receivedAt: daysAgo(2),
    decisionDue: null,
    applicationType: "Change of use",
    trades: ["Electrical"],
    description:
      "Change of use from storage to light industrial with new electrical supply and external lighting.",
    applicant: "Foundry Park Estates (sample)",
    sourceUrl: "https://planning.example.gov.uk/applications/EX%2F26%2F01455",
    location: { lat: 51.3801, lng: -0.0918 },
    approximate: false,
  },
];
