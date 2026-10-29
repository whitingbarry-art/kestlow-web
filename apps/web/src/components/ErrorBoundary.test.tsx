import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "./ErrorBoundary";

function Broken(): never {
  throw new Error("Cannot read properties of undefined");
}

describe("ErrorBoundary", () => {
  it("shows the page when nothing's wrong", () => {
    render(
      <ErrorBoundary reporter={{ report: vi.fn() }}>
        <p>Leads</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("Leads")).toBeInTheDocument();
  });

  it("shows a way out instead of a blank page, and reports what broke", () => {
    // React logs the error it caught; that's expected here.
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const report = vi.fn();

    render(
      <ErrorBoundary reporter={{ report }}>
        <Broken />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("heading", { name: "Something went wrong" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload the page" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "support@kestlow.co.uk" })).toBeInTheDocument();
    expect(report).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Cannot read properties of undefined" }),
    );
    expect((report.mock.calls[0][0] as Error).stack).toContain("Components:");
    consoleError.mockRestore();
  });
});
