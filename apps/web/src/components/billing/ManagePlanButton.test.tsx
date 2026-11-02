import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createSampleLeadsApi } from "../../api/sampleLeadsApi";
import { canManagePlan } from "../../logic/billing";
import { providers } from "../../test/providers";
import { ManagePlanButton } from "./ManagePlanButton";

describe("ManagePlanButton (KES-51)", () => {
  it("says why when there's no plan to manage", async () => {
    const user = userEvent.setup();
    const api = createSampleLeadsApi();
    api.openPortal = () =>
      Promise.resolve({ ok: false, message: "There's no paid plan to manage yet." });
    const goTo = vi.fn();
    render(<ManagePlanButton goTo={goTo} />, { wrapper: providers(api) });

    await user.click(screen.getByRole("button", { name: "Manage my plan" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "There's no paid plan to manage yet.",
    );
    expect(goTo).not.toHaveBeenCalled();
  });

  it("offers billing's email if the page can't be reached", async () => {
    const user = userEvent.setup();
    const api = createSampleLeadsApi();
    api.openPortal = () => Promise.reject(new Error("offline"));
    render(<ManagePlanButton goTo={vi.fn()} />, { wrapper: providers(api) });

    await user.click(screen.getByRole("button", { name: "Manage my plan" }));

    expect(await screen.findByRole("status")).toHaveTextContent("billing@kestlow.co.uk");
  });
});

describe("canManagePlan", () => {
  it("is for a paid plan, now or before, not a trial or none", () => {
    expect(canManagePlan(undefined)).toBe(false);
    for (const status of ["active", "past_due", "paused", "canceled"] as const)
      expect(canManagePlan({ status } as never)).toBe(true);
    expect(canManagePlan({ status: "trialing" } as never)).toBe(false);
    expect(canManagePlan({ status: null } as never)).toBe(false);
  });
});
