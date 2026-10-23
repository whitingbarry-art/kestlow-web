import type { Meta, StoryObj } from "@storybook/react-vite";
import { useLeads } from "../../hooks/useLeads";
import { failingLeadsApi, pendingLeadsApi, withLeadsApi } from "../../stories/withLeadsApi";
import { SavedView } from "./SavedView";

interface SavedViewStoryArgs {
  savedIds: string[];
  cardsClickable: boolean;
}

function SavedViewStory({ savedIds, cardsClickable }: SavedViewStoryArgs) {
  const state = useLeads({ initialSavedIds: savedIds });
  return <SavedView leads={state} cardsClickable={cardsClickable} />;
}

const meta = {
  title: "Views/SavedView",
  component: SavedViewStory,
  args: { savedIds: ["sample-1", "sample-3"], cardsClickable: false },
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

export const WithSavedLeads: Story = { decorators: [withLeadsApi()] };

export const Empty: Story = { args: { savedIds: [] }, decorators: [withLeadsApi()] };

export const Loading: Story = { decorators: [withLeadsApi(pendingLeadsApi)] };

export const LoadFailed: Story = { decorators: [withLeadsApi(failingLeadsApi)] };
