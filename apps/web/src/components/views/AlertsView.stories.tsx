import type { Meta, StoryObj } from "@storybook/react-vite";
import { useAlertSettings } from "../../hooks/useAlertSettings";
import { AlertsView } from "./AlertsView";

function AlertsViewStory() {
  const settings = useAlertSettings();
  return <AlertsView settings={settings} />;
}

const meta = {
  title: "Views/AlertsView",
  component: AlertsViewStory,
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-[520px]">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AlertsViewStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
