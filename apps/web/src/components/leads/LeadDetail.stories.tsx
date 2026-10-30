import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { approximateLead, maskedLead, multiTradeLead, sampleLead } from "../../stories/fixtures";
import { LeadDetail } from "./LeadDetail";

const meta = {
  title: "Leads/LeadDetail",
  component: LeadDetail,
  args: { lead: sampleLead, saved: false, onToggleSave: fn() },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <LeadDetail
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
} satisfies Meta<typeof LeadDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Saved: Story = { args: { lead: multiTradeLead, saved: true } };

export const ApproximateLocation: Story = { args: { lead: approximateLead } };

/** On the free plan: the area, not the address, and the way to see it (KES-52). */
export const FreePlan: Story = { args: { lead: maskedLead } };
