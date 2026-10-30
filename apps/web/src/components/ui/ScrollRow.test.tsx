import { act, fireEvent, render, screen } from "@testing-library/react";
import { ScrollRow } from "./ScrollRow";

/** jsdom lays nothing out, so give the row a width, a content width and a scroll position. */
function renderRow({ width = 300, content = 900, at = 0 } = {}) {
  const scrollBy = vi.fn();
  render(
    <ScrollRow role="group" aria-label="Filter by trade">
      <span>Roofing</span>
    </ScrollRow>,
  );
  const row = screen.getByRole("group");
  Object.defineProperties(row, {
    clientWidth: { value: width, configurable: true },
    scrollWidth: { value: content, configurable: true },
    scrollLeft: { value: at, configurable: true, writable: true },
  });
  row.scrollBy = scrollBy;
  return {
    row,
    scrollBy,
    moveTo: (left: number) =>
      act(() => {
        row.scrollLeft = left;
        fireEvent.scroll(row);
      }),
  };
}

const arrows = () => ({
  left: screen.queryByTestId("scroll-left"),
  right: screen.queryByTestId("scroll-right"),
});

describe("ScrollRow", () => {
  it("shows the › arrow only while there's more to the right, and ‹ only to the left", () => {
    const { moveTo } = renderRow();

    moveTo(0);
    expect(arrows().left).toBeNull();
    expect(arrows().right).not.toBeNull();

    moveTo(300);
    expect(arrows().left).not.toBeNull();
    expect(arrows().right).not.toBeNull();

    moveTo(600);
    expect(arrows().left).not.toBeNull();
    expect(arrows().right).toBeNull();
  });

  it("shows no arrows when everything fits", () => {
    const { moveTo } = renderRow({ width: 900, content: 900 });

    moveTo(0);
    expect(arrows()).toEqual({ left: null, right: null });
  });

  it("glides most of a row's width each way", () => {
    const { moveTo, scrollBy } = renderRow();
    moveTo(300);

    fireEvent.click(arrows().right!);
    fireEvent.click(arrows().left!);

    expect(scrollBy).toHaveBeenNthCalledWith(1, { left: 210, behavior: "smooth" });
    expect(scrollBy).toHaveBeenNthCalledWith(2, { left: -210, behavior: "smooth" });
  });

  it("keeps the arrows away from screen readers and the Tab key, which reach every button anyway", () => {
    const { moveTo } = renderRow();
    moveTo(300);

    expect(screen.queryByRole("button")).toBeNull();
    expect(arrows().right).toHaveAttribute("tabindex", "-1");
  });

  it("fills the triangles while the row moves, and outlines them again once it settles", () => {
    vi.useFakeTimers();
    try {
      const { moveTo } = renderRow();
      moveTo(0);
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(arrows().right).not.toHaveAttribute("data-moving");

      moveTo(100);
      expect(arrows().right).toHaveAttribute("data-moving");
      expect(arrows().left).toHaveAttribute("data-moving");

      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(arrows().right).not.toHaveAttribute("data-moving");
    } finally {
      vi.useRealTimers();
    }
  });
});
