import type { Meta, StoryObj } from "@storybook/react-vite";
import { NewBadge } from "./NewBadge";

const meta = {
  title: "Leads/NewBadge",
  component: NewBadge,
} satisfies Meta<typeof NewBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
