import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";

describe("App", () => {
  it("renders the leads view with every lead", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "New leads near you" })).toBeInTheDocument();
    expect(screen.getByText("2 new today within 15 miles")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "View lead" })).toHaveLength(4);
  });

  it("filters leads by trade", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "Roofing" }));
    expect(screen.getAllByRole("button", { name: "View lead" })).toHaveLength(1);
  });

  it("opens a lead's details", async () => {
    render(<App />);
    await userEvent.click(screen.getAllByRole("button", { name: "View lead" })[1]);
    const detail = screen.getByRole("region", { name: "Lead details" });
    expect(within(detail).getByText("SD/26/00977")).toBeInTheDocument();
  });

  it("moves focus into the mobile detail panel and back again on Escape", async () => {
    render(<App />);
    const main = screen.getByRole("main");
    const detail = screen.getByRole("region", { name: "Lead details" });
    expect(detail).toHaveAttribute("inert");

    const viewButton = screen.getAllByRole("button", { name: "View lead" })[1];
    await userEvent.click(viewButton);
    expect(detail).toHaveFocus();
    expect(detail).not.toHaveAttribute("inert");
    expect(main).toHaveAttribute("inert");

    await userEvent.keyboard("{Escape}");
    expect(viewButton).toHaveFocus();
    expect(detail).toHaveAttribute("inert");
    expect(main).not.toHaveAttribute("inert");
  });

  it("returns focus from the Back button", async () => {
    render(<App />);
    const viewButton = screen.getAllByRole("button", { name: "View lead" })[0];
    await userEvent.click(viewButton);
    await userEvent.click(screen.getByRole("button", { name: "Back to leads" }));
    expect(viewButton).toHaveFocus();
  });

  it("names the page after the current view", async () => {
    render(<App />);
    expect(document.title).toBe("Leads – Kestlow");
    const [mainNav] = screen.getAllByRole("navigation", { name: "Main" });
    await userEvent.click(within(mainNav).getByRole("button", { name: "Alerts" }));
    expect(document.title).toBe("Alerts – Kestlow");
  });

  it("shows saved leads and alert settings", async () => {
    render(<App />);
    const [mainNav] = screen.getAllByRole("navigation", { name: "Main" });
    await userEvent.click(within(mainNav).getByRole("button", { name: /Saved/ }));
    expect(screen.getByRole("heading", { name: "Saved leads" })).toBeInTheDocument();
    expect(screen.getByText("3 The Green")).toBeInTheDocument();

    await userEvent.click(within(mainNav).getByRole("button", { name: /Alerts/ }));
    const weekend = screen.getByRole("switch", { name: "Weekend alerts" });
    expect(weekend).toHaveAttribute("aria-checked", "false");
    await userEvent.click(weekend);
    expect(weekend).toHaveAttribute("aria-checked", "true");
  });

  it("switches views from the mobile bottom nav", async () => {
    render(<App />);
    const [, bottomNav] = screen.getAllByRole("navigation", { name: "Main" });
    await userEvent.click(within(bottomNav).getByRole("button", { name: /Saved/ }));
    expect(screen.getByRole("heading", { name: "Saved leads" })).toBeInTheDocument();
  });
});
