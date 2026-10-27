import { render, screen } from "@testing-library/react";
import { LeadMap } from "./LeadMap";

const orchardLane = { lat: 51.4247, lng: 0.0261 };

describe("LeadMap", () => {
  it("draws a map and tells screen readers where it is", () => {
    const { container } = render(<LeadMap location={orchardLane} address="14 Orchard Lane" />);

    expect(screen.getByRole("figure")).toHaveTextContent("Map showing where 14 Orchard Lane is.");
    expect(container.querySelector(".leaflet-container")).not.toBeNull();
  });

  it("can't be dragged, zoomed or tabbed into, so it never traps the keyboard", () => {
    const { container } = render(<LeadMap location={orchardLane} address="14 Orchard Lane" />);

    const map = container.querySelector(".leaflet-container")!;
    expect(map).not.toHaveAttribute("tabindex");
    expect(container.querySelector(".leaflet-control-zoom")).toBeNull();
  });

  it("links to a larger OpenStreetMap map of the site, opening in a new tab", () => {
    render(<LeadMap location={orchardLane} address="14 Orchard Lane" />);

    const link = screen.getByRole("link", { name: "Open a larger map (opens in a new tab)" });
    expect(link).toHaveAttribute(
      "href",
      "https://www.openstreetmap.org/?mlat=51.4247&mlon=0.0261#map=18/51.4247/0.0261",
    );
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("follows the lead when it changes", () => {
    const { rerender } = render(<LeadMap location={orchardLane} address="14 Orchard Lane" />);

    rerender(<LeadMap location={{ lat: 51.3709, lng: 0.1063 }} address="Land at Mill Road" />);

    expect(screen.getByRole("figure")).toHaveTextContent("Map showing where Land at Mill Road is.");
    expect(screen.getByRole("link", { name: /Open a larger map/ })).toHaveAttribute(
      "href",
      "https://www.openstreetmap.org/?mlat=51.3709&mlon=0.1063#map=18/51.3709/0.1063",
    );
  });
});
