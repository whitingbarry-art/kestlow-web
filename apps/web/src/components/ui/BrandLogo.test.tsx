import { render, screen } from "@testing-library/react";
import { BrandLogo } from "./BrandLogo";

describe("BrandLogo", () => {
  it("links to the home page", () => {
    render(<BrandLogo />);

    expect(screen.getByRole("link", { name: "Kestlow home" })).toHaveAttribute("href", "/");
  });
});
