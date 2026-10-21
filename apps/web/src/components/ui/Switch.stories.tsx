import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { Switch } from "./Switch";

const meta = {
  title: "UI/Switch",
  component: Switch,
  args: { label: "Email alerts", checked: false, onToggle: fn() },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <Switch
        {...args}
        onToggle={() => {
          args.onToggle();
          updateArgs({ checked: !args.checked });
        }}
      />
    );
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const On: Story = { args: { checked: true } };
