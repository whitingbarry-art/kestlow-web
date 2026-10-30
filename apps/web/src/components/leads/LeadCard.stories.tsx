import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import {
  approximateLead,
  maskedLead,
  multiTradeLead,
  olderLead,
  sampleLead,
} from "../../stories/fixtures";
import { LeadCard } from "./LeadCard";

const meta = {
  title: "Leads/LeadCard",
  component: LeadCard,
  args: {
    lead: sampleLead,
    selected: false,
    saved: false,
    clickable: true,
    onOpen: fn(),
    onToggleSave: fn(),
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <LeadCard
        {...args}
        onToggleSave={(id) => {
          args.onToggleSave(id);
          updateArgs({ saved: !args.saved });
        }}
      />
    );
  },
  decorators: [
    (Story) => (
      <div className="max-w-[520px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LeadCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const New: Story = {};

export const Selected: Story = { args: { selected: true } };

export const Saved: Story = { args: { lead: olderLead, saved: true } };

export const MultipleTrades: Story = { args: { lead: multiTradeLead } };

export const ApproximateLocation: Story = { args: { lead: approximateLead } };

export const FreePlan: Story = { args: { lead: maskedLead } };
