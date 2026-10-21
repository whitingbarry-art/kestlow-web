import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Button } from "./Button";

const meta = {
  title: "UI/Button",
  component: Button,
  args: { children: "View lead", onClick: fn() },
  argTypes: { variant: { control: "inline-radio", options: ["primary", "ghost"] } },
  decorators: [
    (Story) => (
      <div className="flex max-w-xs">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };

export const Ghost: Story = { args: { variant: "ghost", children: "Save" } };
