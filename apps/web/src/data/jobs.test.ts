import { jobsHref } from "./jobs";

describe("jobsHref", () => {
  it("keeps the card or ad's code", () => {
    expect(jobsHref("screwfix-bromley")).toBe("/jobs?ref=screwfix-bromley");
  });

  it("is the plain page without one", () => {
    expect(jobsHref()).toBe("/jobs");
  });
});
