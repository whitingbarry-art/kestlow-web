import { SAMPLE_LEADS } from "../data/leads";
import { findLead, formatLeadSummary, toggleId } from "./leads";

describe("leads logic", () => {
  it("formats the summary", () => {
    expect(formatLeadSummary(2, 15)).toBe("2 new today within 15 miles");
  });

  it("finds a lead by id", () => {
    expect(findLead(SAMPLE_LEADS, "sample-3")?.address).toBe("3 The Green");
    expect(findLead(SAMPLE_LEADS, "nope")).toBeUndefined();
    expect(findLead(SAMPLE_LEADS, null)).toBeUndefined();
  });

  it("toggles an id without mutating the original set", () => {
    const original = new Set(["a"]);
    expect([...toggleId(original, "b")]).toEqual(["a", "b"]);
    expect([...toggleId(original, "a")]).toEqual([]);
    expect([...original]).toEqual(["a"]);
  });
});
