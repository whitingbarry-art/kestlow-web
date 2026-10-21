import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { mobileViewport } from "../../stories/fixtures";
import { TopBar } from "./TopBar";

const meta = {
  title: "Layout/TopBar",
  component: TopBar,
  args: { onToggleTheme: fn() },
  parameters: { layout: "fullscreen" },
  globals: mobileViewport,
} satisfies Meta<typeof TopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Mobile: Story = {};
