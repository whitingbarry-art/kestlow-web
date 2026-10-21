import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { NAV_ITEMS } from "../../data/navigation";
import { mobileViewport } from "../../stories/fixtures";
import { BottomNav } from "./BottomNav";

const meta = {
  title: "Layout/BottomNav",
  component: BottomNav,
  args: { items: NAV_ITEMS, activeView: "leads", onNavigate: fn() },
  argTypes: { activeView: { control: "inline-radio", options: ["leads", "saved", "alerts"] } },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <BottomNav
        {...args}
        onNavigate={(view) => {
          args.onNavigate(view);
          updateArgs({ activeView: view });
        }}
      />
    );
  },
  parameters: { layout: "fullscreen" },
  globals: mobileViewport,
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Leads: Story = {};

export const Alerts: Story = { args: { activeView: "alerts" } };
