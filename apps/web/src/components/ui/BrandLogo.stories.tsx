import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrandLogo } from "./BrandLogo";

const meta = {
  title: "UI/BrandLogo",
  component: BrandLogo,
  args: { size: 36 },
  decorators: [
    (Story) => (
      <div className="inline-block bg-side p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BrandLogo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = { args: { size: 24 } };
