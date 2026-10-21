import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { NAV_ITEMS } from "../../data/navigation";
import { desktopViewport } from "../../stories/fixtures";
import { Sidebar } from "./Sidebar";

const meta = {
  title: "Layout/Sidebar",
  component: Sidebar,
  args: { items: NAV_ITEMS, activeView: "leads", onNavigate: fn(), onToggleTheme: fn() },
  argTypes: { activeView: { control: "inline-radio", options: ["leads", "saved", "alerts"] } },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <Sidebar
        {...args}
        onNavigate={(view) => {
          args.onNavigate(view);
          updateArgs({ activeView: view });
        }}
      />
    );
  },
  decorators: [
    (Story) => (
      <div className="grid h-screen w-60">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "fullscreen" },
  globals: desktopViewport,
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Leads: Story = {};

export const Saved: Story = { args: { activeView: "saved" } };
