import { render, screen } from "@testing-library/react";
import { BrandLogo } from "./BrandLogo";

describe("BrandLogo", () => {
  it("links to the home page", () => {
    render(<BrandLogo />);

    expect(screen.getByRole("link", { name: "Kestlow home" })).toHaveAttribute("href", "/");
  });

  it("marks the name as our trade mark, without screen readers saying so (KES-159)", () => {
    render(<BrandLogo />);

    const link = screen.getByRole("link", { name: "Kestlow home" });
    expect(link).toHaveTextContent("Kestlow™");
  });
});
