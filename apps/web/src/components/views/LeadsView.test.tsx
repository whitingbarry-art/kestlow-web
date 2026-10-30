import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { LeadsApi } from "../../api/leads";
import { createSampleLeadsApi, onTradeLimitedPlan } from "../../api/sampleLeadsApi";
import { useLeads } from "../../hooks/useLeads";
import { providers } from "../../test/providers";
import { LeadsView } from "./LeadsView";

function Leads() {
  return <LeadsView leads={useLeads()} cardsClickable={false} />;
}

/** The trade buttons' names, in order, once the plan's settings have loaded. */
async function tradeButtons(api: LeadsApi, settled: string | RegExp) {
  render(<Leads />, { wrapper: providers(api) });
  const group = await screen.findByRole("group", { name: "Filter by trade" });
  await within(group).findByRole("button", { name: settled });
  return within(group)
    .getAllByRole("button")
    .map((button) => button.textContent);
}

describe("LeadsView trade buttons", () => {
  it("on a one-trade plan, shows that trade as chosen, with no All trades, and the rest locked", async () => {
    expect(await tradeButtons(onTradeLimitedPlan(), /Electrical.*not on your plan/)).toEqual([
      "Roofing",
      "Electrical (not on your plan)",
      "Landscaping (not on your plan)",
      "Groundworks (not on your plan)",
    ]);
    expect(screen.getByRole("button", { name: "Roofing" })).toHaveAttribute("aria-pressed", "true");
  });

  it("says why a locked trade isn't there, with a way to see the plans", async () => {
    const user = userEvent.setup();
    await tradeButtons(onTradeLimitedPlan(), /Landscaping.*not on your plan/);

    await user.click(screen.getByRole("button", { name: /Landscaping.*not on your plan/ }));

    expect(
      screen.getByText(/Landscaping isn't on your plan\. Pro covers all four trades\./),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "See plans" })).toHaveAttribute("href", "/pricing");
  });

  it("keeps All trades when the plan covers more than one", async () => {
    expect(
      await tradeButtons(
        onTradeLimitedPlan(["Roofing", "Landscaping"]),
        /Electrical.*not on your plan/,
      ),
    ).toEqual([
      "All trades",
      "Roofing",
      "Landscaping",
      "Electrical (not on your plan)",
      "Groundworks (not on your plan)",
    ]);
  });

  it("locks nothing when the plan covers every trade", async () => {
    expect(await tradeButtons(createSampleLeadsApi(), "Groundworks")).toEqual([
      "All trades",
      "Roofing",
      "Electrical",
      "Landscaping",
      "Groundworks",
    ]);
  });
});
