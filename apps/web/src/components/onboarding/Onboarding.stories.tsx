import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { onTradeLimitedPlan } from "../../api/sampleLeadsApi";
import { withLeadsApi } from "../../stories/withLeadsApi";
import { Onboarding } from "./Onboarding";

const meta = {
  title: "Onboarding/Onboarding",
  component: Onboarding,
  args: { onDone: fn() },
  decorators: [withLeadsApi()],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Onboarding>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Step 1 of 3; Continue moves through the trades and distance with the sample API. */
export const FirstStep: Story = {};

/** On the free plan (KES-52): the trades step, with the first ticked marked as the main trade. */
export const MainTrade: Story = {
  decorators: [withLeadsApi(onTradeLimitedPlan({ chosen: [] }))],
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(await canvas.findByLabelText("Your postcode"), "BR1 1AA");
    await userEvent.click(canvas.getByRole("button", { name: "Continue" }));
    await userEvent.click(await canvas.findByRole("checkbox", { name: /Landscaping/ }));
    await userEvent.click(canvas.getByRole("checkbox", { name: /Roofing/ }));
    await expect(canvas.getByText("Main")).toBeVisible();
  },
};
