import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { createSampleLeadsApi } from "../../api/sampleLeadsApi";
import { DEFAULT_DELIVERY } from "../../data/alerts";
import { SAMPLE_LEADS } from "../../data/leads";
import { useAlertSettings } from "../../hooks/useAlertSettings";
import { failingLeadsApi, pendingLeadsApi, withLeadsApi } from "../../stories/withLeadsApi";
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

export const NoBasePostcode: Story = { decorators: [withLeadsApi()] };

export const WithBasePostcode: Story = {
  decorators: [withLeadsApi(createSampleLeadsApi(SAMPLE_LEADS, 20, [], "BR1 1AA"))],
};

export const Loading: Story = { decorators: [withLeadsApi(pendingLeadsApi)] };

export const LoadFailed: Story = { decorators: [withLeadsApi(failingLeadsApi)] };

/** Push turned on from another device: this browser isn't subscribed, so it offers to be (KES-118). */
function pushOnElsewhereApi() {
  const api = createSampleLeadsApi(SAMPLE_LEADS, 20, [], "BR1 1AA");
  void api.updateAlertSettings({ delivery: { ...DEFAULT_DELIVERY, push: true } });
  return api;
}

export const PushOnAnotherDevice: Story = {
  decorators: [withLeadsApi(pushOnElsewhereApi())],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("button", { name: "Turn on for this device" }),
    ).toBeVisible();
  },
};
