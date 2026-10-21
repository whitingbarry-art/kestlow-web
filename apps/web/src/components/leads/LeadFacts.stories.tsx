import type { Meta, StoryObj } from "@storybook/react-vite";
import { sampleLead } from "../../stories/fixtures";
import { LeadFacts } from "./LeadFacts";

const meta = {
  title: "Leads/LeadFacts",
  component: LeadFacts,
  args: { lead: sampleLead },
  decorators: [
    (Story) => (
      <div className="max-w-[520px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LeadFacts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
