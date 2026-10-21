import type { Meta, StoryObj } from "@storybook/react-vite";
import { SectionTitle } from "./SectionTitle";

const meta = {
  title: "UI/SectionTitle",
  component: SectionTitle,
  args: { children: "Delivery" },
} satisfies Meta<typeof SectionTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
