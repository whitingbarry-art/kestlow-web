import { jobsHref, tradeFrom } from "./jobs";

describe("jobsHref", () => {
  it("keeps the card or ad's code", () => {
    expect(jobsHref("screwfix-bromley")).toBe("/jobs?ref=screwfix-bromley");
  });

  it("is the plain page without one", () => {
    expect(jobsHref()).toBe("/jobs");
  });
});

describe("tradeFrom (KES-160)", () => {
  it("takes the trade a link names, in any case", () => {
    expect(tradeFrom("?trade=Roofing")).toBe("Roofing");
    expect(tradeFrom("?trade=electrical&ref=ad-jobs")).toBe("Electrical");
  });

  it("takes the trade of the group a link was posted in", () => {
    expect(tradeFrom("?ref=fb-roofers")).toBe("Roofing");
    expect(tradeFrom("?ref=fb-electricians")).toBe("Electrical");
    expect(tradeFrom("?ref=fb-landscapers")).toBe("Landscaping");
    expect(tradeFrom("?ref=fb-groundworks")).toBe("Groundworks");
  });

  it("picks nothing for a link that isn't about one trade", () => {
    expect(tradeFrom("?ref=fb-builders")).toBeUndefined();
    expect(tradeFrom("?ref=ad-jobs")).toBeUndefined();
    expect(tradeFrom("?trade=plumbing")).toBeUndefined();
    expect(tradeFrom("")).toBeUndefined();
  });
});
