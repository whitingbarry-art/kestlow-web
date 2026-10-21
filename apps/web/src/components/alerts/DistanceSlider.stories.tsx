import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { formatDistance } from "../../logic/alerts";
import { DistanceSlider } from "./DistanceSlider";

const meta = {
  title: "Alerts/DistanceSlider",
  component: DistanceSlider,
  args: {
    value: 15,
    min: 1,
    max: 50,
    label: formatDistance(15),
    basePostcode: "AB1 2CD (sample)",
    onChange: fn(),
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <DistanceSlider
        {...args}
        onChange={(miles) => {
          args.onChange(miles);
          updateArgs({ value: miles, label: formatDistance(miles) });
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
} satisfies Meta<typeof DistanceSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Minimum: Story = { args: { value: 1, label: formatDistance(1) } };
