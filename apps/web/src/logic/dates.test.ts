import { daysAgo, formatDate, formatReceived, londonToday } from "./dates";

describe("dates", () => {
  it("takes today's date in the UK, not UTC", () => {
    // 23:30 UTC on 1 July is 00:30 on 2 July in British Summer Time.
    expect(londonToday(new Date("2026-07-01T23:30:00Z"))).toBe("2026-07-02");
    expect(londonToday(new Date("2026-12-01T23:30:00Z"))).toBe("2026-12-01");
  });

  it("counts days back from today", () => {
    expect(daysAgo(2, new Date("2026-10-23T12:00:00Z"))).toBe("2026-10-21");
  });

  it("formats a date for display", () => {
    expect(formatDate("2026-12-18")).toBe("18 Dec 2026");
    expect(formatDate("2027-01-02")).toBe("02 Jan 2027");
  });

  it.each([
    ["2026-10-23", "Today"],
    ["2026-10-22", "Yesterday"],
    ["2026-10-20", "3 days ago"],
    ["2026-10-17", "6 days ago"],
    ["2026-10-16", "16 Oct 2026"],
  ])("says when %s was received", (receivedAt, expected) => {
    expect(formatReceived(receivedAt, "2026-10-23")).toBe(expected);
  });
});
