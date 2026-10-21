import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { IconButton } from "./IconButton";

const meta = {
  title: "UI/IconButton",
  component: IconButton,
  args: { onClick: fn() },
  decorators: [
    (Story) => (
      <div className="inline-block bg-side p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Back: Story = { args: { "aria-label": "Back", children: "←" } };

export const ThemeToggle: Story = { args: { "aria-label": "Switch light or dark", children: "◐" } };
