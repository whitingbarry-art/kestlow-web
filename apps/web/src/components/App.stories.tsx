import type { Meta, StoryObj } from "@storybook/react-vite";
import { desktopViewport, mobileViewport } from "../stories/fixtures";
import { withLeadsApi } from "../stories/withLeadsApi";
import { App } from "./App";

const meta = {
  title: "App",
  component: App,
  decorators: [withLeadsApi()],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Mobile: Story = { globals: mobileViewport };

export const Desktop: Story = { globals: desktopViewport };
