import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { SAMPLE_LEADS } from "../../data/leads";
import { LaunchPage } from "./LaunchPage";

const meta = {
  title: "Site/LaunchPage",
  component: LaunchPage,
  args: {
    source: "screwfix-bromley",
    recordStep: fn(),
    // Sample numbers and leads, shown the way the free plan shows them.
    loadPreview: () =>
      Promise.resolve({
        radiusMiles: 15,
        days: 30,
        total: 305,
        byTrade: { Roofing: 133, Electrical: 277, Landscaping: 33, Groundworks: 102 },
        examples: SAMPLE_LEADS.slice(0, 4).map((lead) => ({ ...lead, masked: true })),
      }),
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof LaunchPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = { globals: { viewport: { value: "desktop" } } };

export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
