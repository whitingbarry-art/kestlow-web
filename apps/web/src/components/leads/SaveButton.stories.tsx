import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { SaveButton } from "./SaveButton";

const meta = {
  title: "Leads/SaveButton",
  component: SaveButton,
  args: { saved: false, onToggle: fn() },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <div className="flex max-w-[200px]">
        <SaveButton
          {...args}
          onToggle={() => {
            args.onToggle();
            updateArgs({ saved: !args.saved });
          }}
        />
      </div>
    );
  },
} satisfies Meta<typeof SaveButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotSaved: Story = {};

export const Saved: Story = { args: { saved: true } };
