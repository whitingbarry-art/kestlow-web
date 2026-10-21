import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { desktopViewport, mobileViewport, sampleLead } from "../../stories/fixtures";
import { LeadDetail } from "../leads/LeadDetail";
import { DetailPanel } from "./DetailPanel";

const meta = {
  title: "Layout/DetailPanel",
  component: DetailPanel,
  args: {
    open: true,
    onBack: fn(),
    children: <LeadDetail lead={sampleLead} saved={false} onToggleSave={fn()} />,
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof DetailPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MobileOpen: Story = { globals: mobileViewport };

export const Desktop: Story = { globals: desktopViewport };
