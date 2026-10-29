import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { LEAD_SORTS } from "../../data/leads";
import { LeadSearch } from "./LeadSearch";

function renderSearch(props: Partial<ComponentProps<typeof LeadSearch>> = {}) {
  const handlers = { onTextChange: vi.fn(), onClear: vi.fn(), onSortChange: vi.fn() };
  render(
    <LeadSearch
      text=""
      search=""
      total={24}
      sortOptions={LEAD_SORTS}
      sort="newest"
      {...handlers}
      {...props}
    />,
  );
  return handlers;
}

describe("LeadSearch", () => {
  it("is a labelled search box", () => {
    renderSearch();
    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: "Search leads by town, street or postcode" }),
    ).toBeInTheDocument();
  });

  it("passes on what's typed", async () => {
    const user = userEvent.setup();
    const { onTextChange } = renderSearch();
    await user.type(screen.getByRole("searchbox"), "B");
    expect(onTextChange).toHaveBeenCalledWith("B");
  });

  it.each([
    ["", 24, "24 leads"],
    ["Chislehurst", 3, "3 leads match “Chislehurst”"],
    ["BR7 6LT", 1, "1 lead matches “BR7 6LT”"],
    ["Narnia", 0, "0 leads match “Narnia”"],
  ])("announces the count for %j", (search, total, text) => {
    renderSearch({ text: search, search, total });
    expect(screen.getByText(text)).toHaveAttribute("aria-live", "polite");
  });

  it("clears with the button or Escape", async () => {
    const user = userEvent.setup();
    const { onClear } = renderSearch({ text: "Eltham", search: "Eltham" });

    await user.click(screen.getByRole("button", { name: "Clear search" }));
    await user.type(screen.getByRole("searchbox"), "{Escape}");
    expect(onClear).toHaveBeenCalledTimes(2);
  });

  it("has no clear button when there's nothing to clear", () => {
    renderSearch();
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  it("changes the sort", async () => {
    const user = userEvent.setup();
    const { onSortChange } = renderSearch();
    await user.selectOptions(screen.getByRole("combobox", { name: "Sort" }), "Nearest first");
    expect(onSortChange).toHaveBeenCalledWith("nearest");
  });
});
