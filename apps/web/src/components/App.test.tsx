import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { LeadsApi } from "../api/leads";
import { createSampleLeadsApi } from "../api/sampleLeadsApi";
import { providers } from "../test/providers";
import { App } from "./App";

describe("App", () => {
  it("shows who's signed in, above Sign out", async () => {
    render(<App />, { wrapper: providers() });

    const sidebar = screen.getByRole("complementary");
    expect(await within(sidebar).findByText("Dave Roofer")).toBeInTheDocument();
    expect(within(sidebar).getByText(/Signed in as/)).toHaveTextContent("Signed in as Dave Roofer");
  });

  it("renders the leads view with every lead", async () => {
    render(<App />, { wrapper: providers() });
    expect(screen.getByRole("heading", { name: "New leads near you" })).toBeInTheDocument();
    expect(await screen.findAllByRole("button", { name: "View lead" })).toHaveLength(4);
    expect(screen.getByText("2 new today within 15 miles")).toBeInTheDocument();
  });

  it("filters leads by trade", async () => {
    render(<App />, { wrapper: providers() });
    await screen.findAllByRole("button", { name: "View lead" });
    await userEvent.click(screen.getByRole("button", { name: "Roofing" }));
    expect(await screen.findAllByRole("button", { name: "View lead" })).toHaveLength(1);
  });

  it("opens a lead's details", async () => {
    render(<App />, { wrapper: providers() });
    await userEvent.click((await screen.findAllByRole("button", { name: "View lead" }))[1]);
    const detail = screen.getByRole("region", { name: "Lead details" });
    expect(within(detail).getByText("SD/26/00977")).toBeInTheDocument();
  });

  it("moves focus into the mobile detail panel and back again on Escape", async () => {
    render(<App />, { wrapper: providers() });
    const main = screen.getByRole("main");
    const detail = screen.getByRole("region", { name: "Lead details" });
    expect(detail).toHaveAttribute("inert");

    const viewButton = (await screen.findAllByRole("button", { name: "View lead" }))[1];
    await userEvent.click(viewButton);
    expect(detail).toHaveFocus();
    expect(detail).not.toHaveAttribute("inert");
    expect(main).toHaveAttribute("inert");

    await userEvent.keyboard("{Escape}");
    expect(viewButton).toHaveFocus();
    expect(detail).toHaveAttribute("inert");
    expect(main).not.toHaveAttribute("inert");
  });

  it("keeps the detail panel available on desktop and refocuses it on every open", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query === "(min-width: 900px)",
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    try {
      render(<App />, { wrapper: providers() });
      const detail = screen.getByRole("region", { name: "Lead details" });
      expect(detail).not.toHaveAttribute("inert");

      const viewButton = (await screen.findAllByRole("button", { name: "View lead" }))[1];
      await userEvent.click(viewButton);
      expect(detail).toHaveFocus();
      expect(screen.getByRole("main")).not.toHaveAttribute("inert");

      await userEvent.keyboard("{Escape}");
      expect(detail).toHaveFocus();

      await userEvent.click(viewButton);
      expect(detail).toHaveFocus();
      viewButton.focus();
      await userEvent.click(viewButton);
      expect(detail).toHaveFocus();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("returns focus from the Back button", async () => {
    render(<App />, { wrapper: providers() });
    const viewButton = (await screen.findAllByRole("button", { name: "View lead" }))[0];
    await userEvent.click(viewButton);
    await userEvent.click(screen.getByRole("button", { name: "Back to leads" }));
    expect(viewButton).toHaveFocus();
  });

  it("names the page after the current view", async () => {
    render(<App />, { wrapper: providers() });
    expect(document.title).toBe("Leads – Kestlow");
    const [mainNav] = screen.getAllByRole("navigation", { name: "Main" });
    await userEvent.click(within(mainNav).getByRole("button", { name: "Alerts" }));
    expect(document.title).toBe("Alerts – Kestlow");
  });

  it("shows saved leads and alert settings", async () => {
    render(<App />, { wrapper: providers() });
    const [mainNav] = screen.getAllByRole("navigation", { name: "Main" });
    await userEvent.click(within(mainNav).getByRole("button", { name: /Saved/ }));
    expect(screen.getByRole("heading", { name: "Saved leads" })).toBeInTheDocument();
    expect(screen.getByText("Nothing saved yet. Tap Save on a lead.")).toBeInTheDocument();

    await userEvent.click(within(mainNav).getByRole("button", { name: /Leads/ }));
    const [, , greenSave] = await screen.findAllByRole("button", { name: "Save" });
    await userEvent.click(greenSave);
    await userEvent.click(within(mainNav).getByRole("button", { name: /Saved/ }));
    expect(screen.getByText("3 The Green")).toBeInTheDocument();

    await userEvent.click(within(mainNav).getByRole("button", { name: /Alerts/ }));
    const weekend = screen.getByRole("switch", { name: "Weekend alerts" });
    expect(weekend).toHaveAttribute("aria-checked", "false");
    await userEvent.click(weekend);
    expect(weekend).toHaveAttribute("aria-checked", "true");
  });

  it("shows an error with a retry when the leads can't be loaded", async () => {
    const api = createSampleLeadsApi();
    const listLeads = vi
      .fn<LeadsApi["listLeads"]>()
      .mockRejectedValueOnce(new Error("Network error"))
      .mockImplementation(api.listLeads);
    render(<App />, { wrapper: providers({ ...api, listLeads }) });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Leads couldn't be loaded.");
    await userEvent.click(within(alert).getByRole("button", { name: "Try again" }));
    expect(await screen.findAllByRole("button", { name: "View lead" })).toHaveLength(4);
  });

  it("links a lead to its council page", async () => {
    render(<App />, { wrapper: providers() });
    await userEvent.click((await screen.findAllByRole("button", { name: "View lead" }))[0]);
    const link = screen.getByRole("link", { name: "Open council page (opens in a new tab)" });
    expect(link).toHaveAttribute(
      "href",
      "https://planning.example.gov.uk/applications/EX%2F26%2F01482",
    );
  });

  it("switches views from the mobile bottom nav", async () => {
    render(<App />, { wrapper: providers() });
    const [, bottomNav] = screen.getAllByRole("navigation", { name: "Main" });
    await userEvent.click(within(bottomNav).getByRole("button", { name: /Saved/ }));
    expect(screen.getByRole("heading", { name: "Saved leads" })).toBeInTheDocument();
  });
});
