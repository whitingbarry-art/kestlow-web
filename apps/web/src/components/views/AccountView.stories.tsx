import type { Meta, StoryObj } from "@storybook/react-vite";
import { withLeadsApi } from "../../stories/withLeadsApi";
import { AccountView } from "./AccountView";

const meta = {
  title: "Views/AccountView",
  component: AccountView,
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-[520px]">
        <Story />
      </div>
    ),
    withLeadsApi(),
  ],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AccountView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
