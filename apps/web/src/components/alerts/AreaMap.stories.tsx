import type { Meta, StoryObj } from "@storybook/react-vite";
import { AreaMap } from "./AreaMap";

const meta = {
  title: "Alerts/AreaMap",
  component: AreaMap,
  args: { base: { lat: 51.4057, lng: 0.0144 }, radiusMiles: 15, postcode: "BR1 1AA" },
  decorators: [
    (Story) => (
      <div className="max-w-[520px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AreaMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FifteenMiles: Story = {};

export const FiveMiles: Story = { args: { radiusMiles: 5 } };

export const FiftyMiles: Story = { args: { radiusMiles: 50 } };

export const DefaultArea: Story = { args: { postcode: null } };
