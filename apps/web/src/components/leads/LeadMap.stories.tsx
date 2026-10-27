import type { Meta, StoryObj } from "@storybook/react-vite";
import { multiTradeLead, sampleLead } from "../../stories/fixtures";
import { LeadMap } from "./LeadMap";

const meta = {
  title: "Leads/LeadMap",
  component: LeadMap,
  args: { location: sampleLead.location, address: sampleLead.address },
  decorators: [
    (Story) => (
      <div className="max-w-[520px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LeadMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AnotherSite: Story = {
  args: { location: multiTradeLead.location, address: multiTradeLead.address },
};
