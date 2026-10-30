import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { TRADE_FILTERS } from "../../data/leads";
import { TradeFilters } from "./TradeFilters";

const meta = {
  title: "Leads/TradeFilters",
  component: TradeFilters,
  args: { options: TRADE_FILTERS, active: "All trades", onSelect: fn() },
  argTypes: { active: { control: "select", options: TRADE_FILTERS } },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <TradeFilters
        {...args}
        onSelect={(trade) => {
          args.onSelect(trade);
          updateArgs({ active: trade });
        }}
      />
    );
  },
} satisfies Meta<typeof TradeFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllTrades: Story = {};

export const Roofing: Story = { args: { active: "Roofing" } };

/** A one-trade plan (KES-52): their trade, then the others locked. */
export const OneTradePlan: Story = {
  args: {
    options: ["Roofing"],
    active: "Roofing",
    locked: ["Electrical", "Landscaping", "Groundworks"],
    onSelectLocked: fn(),
  },
};
