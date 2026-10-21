import type { Meta, StoryObj } from "@storybook/react-vite";
import { multiTradeLead, sampleLead } from "../../stories/fixtures";
import { LeadTags } from "./LeadTags";

const meta = {
  title: "Leads/LeadTags",
  component: LeadTags,
  args: { lead: sampleLead, showReceived: false },
} satisfies Meta<typeof LeadTags>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithReceived: Story = { args: { showReceived: true } };

export const MultipleTrades: Story = { args: { lead: multiTradeLead, showReceived: true } };
