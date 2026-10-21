import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { Chip } from "./Chip";

const meta = {
  title: "UI/Chip",
  component: Chip,
  args: { label: "Roofing", active: false, onSelect: fn() },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <Chip
        {...args}
        onSelect={() => {
          args.onSelect();
          updateArgs({ active: !args.active });
        }}
      />
    );
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inactive: Story = {};

export const Active: Story = { args: { active: true } };
