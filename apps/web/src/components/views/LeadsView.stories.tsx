import type { Meta, StoryObj } from "@storybook/react-vite";
import { LEADS } from "../../data/leads";
import { useLeads } from "../../hooks/useLeads";
import type { Lead } from "../../types/lead";
import { LeadsView } from "./LeadsView";

interface LeadsViewStoryArgs {
  leads: Lead[];
  cardsClickable: boolean;
}

function LeadsViewStory({ leads, cardsClickable }: LeadsViewStoryArgs) {
  const state = useLeads({ leads });
  return <LeadsView leads={state} cardsClickable={cardsClickable} />;
}

const meta = {
  title: "Views/LeadsView",
  component: LeadsViewStory,
  args: { leads: LEADS, cardsClickable: false },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-[520px]">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof LeadsViewStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoLeads: Story = { args: { leads: [] } };
