import { LEADS } from "../data/leads";
import { countNewLeads, filterLeadsByTrade, findLead, formatLeadSummary, toggleId } from "./leads";

describe("leads logic", () => {
  it("returns every lead for 'All trades'", () => {
    expect(filterLeadsByTrade(LEADS, "All trades")).toHaveLength(LEADS.length);
  });

  it("filters leads by trade", () => {
    expect(filterLeadsByTrade(LEADS, "Electrical").map((lead) => lead.id)).toEqual([2, 4]);
  });

  it("counts new leads and formats the summary", () => {
    expect(formatLeadSummary(countNewLeads(LEADS), 15)).toBe("2 new today within 15 miles");
  });

  it("finds a lead by id", () => {
    expect(findLead(LEADS, 3)?.address).toBe("3 The Green");
    expect(findLead(LEADS, null)).toBeUndefined();
  });

  it("toggles an id without mutating the original set", () => {
    const original = new Set([1]);
    expect([...toggleId(original, 2)]).toEqual([1, 2]);
    expect([...toggleId(original, 1)]).toEqual([]);
    expect([...original]).toEqual([1]);
  });
});
