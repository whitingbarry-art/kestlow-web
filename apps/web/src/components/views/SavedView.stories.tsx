import type { Meta, StoryObj } from "@storybook/react-vite";
import { useLeads } from "../../hooks/useLeads";
import { SavedView } from "./SavedView";

interface SavedViewStoryArgs {
  savedIds: number[];
  cardsClickable: boolean;
}

function SavedViewStory({ savedIds, cardsClickable }: SavedViewStoryArgs) {
  const state = useLeads({ initialSavedIds: savedIds });
  return <SavedView leads={state} cardsClickable={cardsClickable} />;
}

const meta = {
  title: "Views/SavedView",
  component: SavedViewStory,
  args: { savedIds: [1, 3], cardsClickable: false },
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

export const WithSavedLeads: Story = {};

export const Empty: Story = { args: { savedIds: [] } };
