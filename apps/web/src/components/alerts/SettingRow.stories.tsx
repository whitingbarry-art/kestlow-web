import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { SettingRow } from "./SettingRow";

const meta = {
  title: "Alerts/SettingRow",
  component: SettingRow,
  args: {
    label: "Email alerts",
    description: "Daily digest at 7:30am",
    checked: true,
    onToggle: fn(),
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <SettingRow
        {...args}
        onToggle={() => {
          args.onToggle();
          updateArgs({ checked: !args.checked });
        }}
      />
    );
  },
  decorators: [
    (Story) => (
      <div className="max-w-[520px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SettingRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDescription: Story = {};

export const WithoutDescription: Story = {
  args: { label: "Roofing", description: undefined, checked: false },
};
