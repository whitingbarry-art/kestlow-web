import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoadingState } from "./LoadingState";

const meta = {
  title: "UI/LoadingState",
  component: LoadingState,
  args: { message: "Loading leads…" },
} satisfies Meta<typeof LoadingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
