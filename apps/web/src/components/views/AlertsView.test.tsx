import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createSampleLeadsApi } from "../../api/sampleLeadsApi";
import { useAlertSettings } from "../../hooks/useAlertSettings";
import { providers } from "../../test/providers";
import { AlertsView } from "./AlertsView";

function Alerts() {
  return <AlertsView settings={useAlertSettings()} />;
}

describe("AlertsView", () => {
  it("keeps saying where leads are measured from after the postcode saves", async () => {
    const user = userEvent.setup();
    render(<Alerts />, { wrapper: providers(createSampleLeadsApi()) });

    await user.type(await screen.findByLabelText("Base postcode"), "se91aa");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Saved. Leads are now measured from SE9 1AA.")).toBeVisible();
    expect(screen.getByLabelText("Base postcode")).toHaveValue("SE9 1AA");
    expect(screen.getByText("Leads are measured from here.")).toBeVisible();
  });
});
