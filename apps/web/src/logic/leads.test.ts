import { SAMPLE_LEADS } from "../data/leads";
import { findLead, formatLeadDistance, formatLeadSummary, matchesSearch, sortLeads } from "./leads";

describe("leads logic", () => {
  it("formats the summary", () => {
    expect(formatLeadSummary(2, 15)).toBe("2 new today within 15 miles");
  });

  it("finds a lead by id", () => {
    expect(findLead(SAMPLE_LEADS, "sample-3")?.address).toBe("3 The Green");
    expect(findLead(SAMPLE_LEADS, "nope")).toBeUndefined();
    expect(findLead(SAMPLE_LEADS, null)).toBeUndefined();
  });
});

describe("matchesSearch", () => {
  const lead = { ...SAMPLE_LEADS[0], address: "1 Kemnal Road, Chislehurst, BR7 6LT" };

  it.each(["chislehurst", "Kemnal", "BR7", "br7 6lt", "BR76LT", "Example Borough"])(
    "finds %s",
    (search) => expect(matchesSearch(lead, search)).toBe(true),
  );

  it("doesn't find what isn't there", () => {
    expect(matchesSearch(lead, "Eltham")).toBe(false);
  });
});

describe("sortLeads", () => {
  const order = (sort: Parameters<typeof sortLeads>[1]) =>
    sortLeads(SAMPLE_LEADS, sort).map((lead) => lead.id);

  it("keeps the order given for newest first", () => {
    expect(order("newest")).toEqual(["sample-1", "sample-2", "sample-3", "sample-4"]);
  });

  it("puts the nearest first", () => {
    expect(order("nearest")).toEqual(["sample-1", "sample-2", "sample-4", "sample-3"]);
  });

  it("puts the soonest decision first, and leads with no date last", () => {
    expect(order("decision")).toEqual(["sample-3", "sample-1", "sample-2", "sample-4"]);
  });
});

describe("formatLeadDistance", () => {
  it.each([
    [2.1, false, "2.1 miles"],
    [1, false, "1 mile"],
    [4.3, true, "about 4.3 miles"],
    [1, true, "about 1 mile"],
  ])("%s miles, approximate %s: %s", (miles, approximate, text) => {
    expect(formatLeadDistance({ miles, approximate })).toBe(text);
  });
});
