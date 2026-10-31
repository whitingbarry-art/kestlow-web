import type { Meta, StoryObj } from "@storybook/react-vite";
import { LaunchPage } from "./LaunchPage";

const meta = {
  title: "Site/LaunchPage",
  component: LaunchPage,
  args: { source: "screwfix-bromley" },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof LaunchPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = { globals: { viewport: { value: "desktop" } } };

export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
