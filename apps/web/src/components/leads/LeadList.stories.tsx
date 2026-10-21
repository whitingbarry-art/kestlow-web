import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { LEADS } from "../../data/leads";
import { LeadList } from "./LeadList";

const meta = {
  title: "Leads/LeadList",
  component: LeadList,
  args: {
    leads: LEADS,
    emptyMessage: "No leads for this trade yet.",
    selectedId: null,
    clickable: true,
    isSaved: (id) => id === 3,
    onOpen: fn(),
    onToggleSave: fn(),
  },
  decorators: [
    (Story) => (
      <div className="max-w-[520px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LeadList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelection: Story = { args: { selectedId: 2 } };

export const Empty: Story = { args: { leads: [] } };
