import type { Meta, StoryObj } from "@storybook/react-vite";
import { createSampleLeadsApi } from "../../api/sampleLeadsApi";
import { SAMPLE_LEADS } from "../../data/leads";
import { useLeads } from "../../hooks/useLeads";
import { failingLeadsApi, pendingLeadsApi, withLeadsApi } from "../../stories/withLeadsApi";
import { LeadsView } from "./LeadsView";

interface LeadsViewStoryArgs {
  cardsClickable: boolean;
}

function LeadsViewStory({ cardsClickable }: LeadsViewStoryArgs) {
  const state = useLeads();
  return <LeadsView leads={state} cardsClickable={cardsClickable} />;
}

const meta = {
  title: "Views/LeadsView",
  component: LeadsViewStory,
  args: { cardsClickable: false },
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

export const Default: Story = { decorators: [withLeadsApi()] };

/** Two to a page, so there's more to show. */
export const MorePages: Story = {
  decorators: [withLeadsApi(createSampleLeadsApi(SAMPLE_LEADS, 2))],
};

export const NoLeads: Story = { decorators: [withLeadsApi(createSampleLeadsApi([]))] };

export const Loading: Story = { decorators: [withLeadsApi(pendingLeadsApi)] };

export const LoadFailed: Story = { decorators: [withLeadsApi(failingLeadsApi)] };
