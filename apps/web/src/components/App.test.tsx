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
});
