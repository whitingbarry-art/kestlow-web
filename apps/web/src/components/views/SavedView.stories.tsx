import type { Meta, StoryObj } from "@storybook/react-vite";
import { createSampleLeadsApi } from "../../api/sampleLeadsApi";
import { SAMPLE_LEADS } from "../../data/leads";
import { useLeads } from "../../hooks/useLeads";
import { failingLeadsApi, pendingLeadsApi, withLeadsApi } from "../../stories/withLeadsApi";
import { SavedView } from "./SavedView";

interface SavedViewStoryArgs {
  cardsClickable: boolean;
}

function SavedViewStory({ cardsClickable }: SavedViewStoryArgs) {
  const state = useLeads();
  return <SavedView leads={state} cardsClickable={cardsClickable} />;
}

const meta = {
  title: "Views/SavedView",
  component: SavedViewStory,
  args: { cardsClickable: false },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-[520px]">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SavedViewStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithSavedLeads: Story = {
  decorators: [withLeadsApi(createSampleLeadsApi(SAMPLE_LEADS, 20, ["sample-1", "sample-3"]))],
};

export const Empty: Story = { decorators: [withLeadsApi()] };

export const Loading: Story = { decorators: [withLeadsApi(pendingLeadsApi)] };

export const LoadFailed: Story = { decorators: [withLeadsApi(failingLeadsApi)] };
