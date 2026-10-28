import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { LeadsApi } from "../../api/leads";
import { createSampleLeadsApi } from "../../api/sampleLeadsApi";
import { SAMPLE_LEADS } from "../../data/leads";
import { providers } from "../../test/providers";
import { OnboardingGate } from "./OnboardingGate";

const renderGate = (api: LeadsApi) =>
  render(
    <OnboardingGate>
      <p>The app</p>
    </OnboardingGate>,
    { wrapper: providers(api) },
  );

describe("OnboardingGate", () => {
  it("goes straight to the app for someone who has a base postcode", async () => {
    renderGate(createSampleLeadsApi(SAMPLE_LEADS, 20, [], "BR1 1AA"));

    expect(await screen.findByText("The app")).toBeInTheDocument();
    expect(screen.queryByText(/Step 1 of 3/)).not.toBeInTheDocument();
  });

  it("asks a new account the three questions, saves the answers, then shows the app", async () => {
    const user = userEvent.setup();
    const api = createSampleLeadsApi();
    renderGate(api);

    // 1: postcode. Saving it mustn't end onboarding early.
    expect(await screen.findByRole("heading", { name: "Where are you based?" })).toBeVisible();
    expect(screen.getByText("Step 1 of 3")).toBeVisible();
    await user.type(screen.getByLabelText("Your postcode"), "se91aa");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // 2: trades, all ticked to start with.
    const tradesHeading = await screen.findByRole("heading", { name: "Which trades do you do?" });
    expect(tradesHeading).toHaveFocus();
    await user.click(screen.getByRole("checkbox", { name: "Landscaping" }));
    await user.click(screen.getByRole("checkbox", { name: "Groundworks" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // 3: distance, with the area map.
    expect(await screen.findByRole("heading", { name: "How far will you travel?" })).toBeVisible();
    expect(
      screen.getByText(/Map of the area leads come from: 15 miles around SE9 1AA\./),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show my leads" }));

    expect(await screen.findByText("The app")).toBeInTheDocument();
    expect(await api.getAlertSettings()).toMatchObject({
      postcode: "SE9 1AA",
      trades: ["Roofing", "Electrical"],
      radiusMiles: 15,
    });
  });

  it("can't be skipped: an empty postcode or no trades are refused", async () => {
    const user = userEvent.setup();
    renderGate(createSampleLeadsApi());

    await screen.findByRole("heading", { name: "Where are you based?" });
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("status")).toHaveTextContent("Enter your postcode.");

    await user.type(screen.getByLabelText("Your postcode"), "ZZ9 9ZZ");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(await screen.findByText("We can't find ZZ9 9ZZ. Check it and try again.")).toBeVisible();
    expect(screen.getByLabelText("Your postcode")).toHaveAttribute("aria-invalid", "true");

    await user.clear(screen.getByLabelText("Your postcode"));
    await user.type(screen.getByLabelText("Your postcode"), "BR1 1AA");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await screen.findByRole("heading", { name: "Which trades do you do?" });
    for (const trade of ["Roofing", "Electrical", "Landscaping", "Groundworks"])
      await user.click(screen.getByRole("checkbox", { name: trade }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByRole("status")).toHaveTextContent("Choose at least one trade.");
    expect(screen.queryByText("The app")).not.toBeInTheDocument();
  });

  it("goes back to the previous question", async () => {
    const user = userEvent.setup();
    renderGate(createSampleLeadsApi());

    await user.type(await screen.findByLabelText("Your postcode"), "BR1 1AA");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await screen.findByRole("heading", { name: "Which trades do you do?" });
    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(screen.getByRole("heading", { name: "Where are you based?" })).toHaveFocus();
    expect(screen.getByLabelText("Your postcode")).toHaveValue("BR1 1AA");
  });

  it("says so when the settings can't be loaded", async () => {
    renderGate({
      ...createSampleLeadsApi(),
      getAlertSettings: () => Promise.reject(new Error("Network error")),
    });

    expect(
      await screen.findByText("We couldn't reach Kestlow. Check your connection and try again."),
    ).toBeVisible();
  });
});
