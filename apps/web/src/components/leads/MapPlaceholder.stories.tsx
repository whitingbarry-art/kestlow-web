import type { Meta, StoryObj } from "@storybook/react-vite";
import { MapPlaceholder } from "./MapPlaceholder";

const meta = {
  title: "Leads/MapPlaceholder",
  component: MapPlaceholder,
  decorators: [
    (Story) => (
      <div className="max-w-[520px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MapPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
