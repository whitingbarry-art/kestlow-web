import { render, screen } from "@testing-library/react";
import { AreaMap } from "./AreaMap";

const BROMLEY = { lat: 51.4057, lng: 0.0144 };

describe("AreaMap", () => {
  it("describes the area for screen readers, following the distance", () => {
    const { rerender } = render(<AreaMap base={BROMLEY} radiusMiles={15} postcode="BR1 1AA" />);
    expect(
      screen.getByText("Map of the area leads come from: 15 miles around BR1 1AA."),
    ).toBeInTheDocument();

    rerender(<AreaMap base={BROMLEY} radiusMiles={30} postcode="BR1 1AA" />);
    expect(
      screen.getByText("Map of the area leads come from: 30 miles around BR1 1AA."),
    ).toBeInTheDocument();
  });

  it("says central Bromley until a postcode is set", () => {
    render(<AreaMap base={BROMLEY} radiusMiles={15} postcode={null} />);

    expect(
      screen.getByText("Map of the area leads come from: 15 miles around central Bromley."),
    ).toBeInTheDocument();
  });
});
